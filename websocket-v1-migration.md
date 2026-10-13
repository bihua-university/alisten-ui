# WebSocket v1 协议与前端迁移记录

更新日期：2026-10-10。对照项目：`E:/Project/vue-music`（Lit + TypeScript）。

本次已修改 alisten 服务端，尚未修改 vue-music 前端。**这是 WS 协议的破坏性升级：旧的 `{ action, data, timestamp }` 不再接受，前端必须按本文迁移后再连接新服务端。** HTTP 路径与既有响应结构继续使用原格式；不要把本文的新 WS 载荷直接发给 HTTP 接口。

## 1. 改动与文件入口

原协议存在请求 `action` 与推送 `type` 分离、业务字段混放顶层和 `data`、音乐来源数字/字符串混用、队列缺少歌曲 ID、点赞依赖会变化的数组下标、删除用 `id` 传歌名等问题。本次统一为带版本的消息信封，并为每个请求提供可关联的成功或失败响应。

| 文件 | 用途 | 是否手工维护 |
| --- | --- | --- |
| `protocol/ws.idl.json` | 唯一协议来源；`$defs` 描述 DTO，`x-requests` 描述请求/响应配对，`x-events` 描述广播事件 | 是 |
| `protocol/ws.schema.json` | 完整消息 JSON Schema，含所有请求、响应和事件的判别规则 | 否，生成 |
| `protocol/types.gen.go` | Go DTO、消息名称常量与协议注册表 | 否，生成 |
| `protocol/ws.gen.ts` | TypeScript DTO、按 `type` 区分的请求/响应/事件联合类型 | 否，生成 |
| `protocol/codec.go` | 信封、请求解码与运行时 Schema 校验 | 是 |
| `protocol/music.go` | 音乐领域模型到协议 DTO 的转换 | 是 |
| `cmd/protocolgen/main.go` | 零生成器依赖的 Go 生成命令 | 是 |
| `internal/house/message.go` | 房间播放、成员、队列快照到协议消息的转换 | 是 |

IDL 使用 [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/schema) 的对象、枚举、引用、必填项和范围约束，加少量消息目录元数据。服务端通过嵌入的生成 Schema 校验请求；Go/TS 类型与完整 Schema 均由同一份 IDL 生成。

在 alisten 项目根目录执行：

```sh
go generate ./protocol
go run ./cmd/protocolgen -check
go test ./...
```

前端可复制 `protocol/ws.gen.ts` 为 `src/types/ws-protocol.ts`；联调或开发时若需运行时校验，使用生成的 `protocol/ws.schema.json`，不要拿 IDL 目录文件代替完整消息 Schema。TypeScript 类型检查不能替代对收到的 JSON 的运行时检查。

## 2. 连接与消息信封

连接地址保持：

```text
ws(s)://<host>/server?houseId=<encoded-room-id>&housePwd=<encoded-password>
```

房间与密码仍在握手阶段校验。只接受 UTF-8 JSON 文本帧；入站消息最大 64 KiB。超过限制将关闭连接。无需额外的 WS 子协议或查询参数。

请求：

```json
{
  "version": 1,
  "kind": "request",
  "type": "music.search",
  "requestId": "search-1",
  "data": { "source": "netease", "keyword": "周杰伦", "pageIndex": 1, "pageSize": 20 }
}
```

成功响应：

```json
{
  "version": 1,
  "kind": "response",
  "type": "music.search",
  "requestId": "search-1",
  "data": { "items": [], "totalSize": 0 }
}
```

失败响应：

```json
{
  "version": 1,
  "kind": "response",
  "type": "queue.remove",
  "requestId": "remove-1",
  "data": {},
  "error": { "code": "NOT_FOUND", "message": "未找到对应音乐" }
}
```

广播事件：

```json
{
  "version": 1,
  "kind": "event",
  "type": "settings.updated",
  "data": { "playMode": "random" }
}
```

规范：

- 所有业务数据放在 `data`；它始终是对象，不能省略或为 `null`。空载荷使用 `{}`。
- `kind` 只允许 `request`、`response`、`event`；名称使用 `domain.verb` 或 `domain.updated`。`heartbeat`、`notice`、`protocol.error` 是协议级名称。
- 请求和响应必须有 `requestId`（1–128 个 Unicode 字符）。客户端在同一连接中生成唯一 ID；响应保留请求的 `type` 和 `requestId`。事件没有 `requestId`。
- 成功响应不含 `error`；失败响应的 `data` 为 `{}` 且含 `error`。不得通过解析 `message` 文案判断业务分支。
- Schema 拒绝未声明字段。删除旧信封上的 `action`、`timestamp`、`userId`；不要同时发送新旧字段。
- 服务端异步执行请求，事件与响应可能交错，不同请求可能乱序完成。不要依赖收到某个广播就认为某个请求成功，也不要假定响应先于事件。
- `requestId` 用于关联，**不提供幂等或重放去重**。断线后清理待处理请求、重新获取快照；不要自动重发点歌、点赞、删除、投票等操作。
- 只有可识别的请求类型和有效 ID 能收到关联失败响应。非法 JSON、未知类型或无有效关联 ID 的消息收到 `event / protocol.error`，其 `data` 为 `{ code, message }`。连接通常继续可用。

## 3. 公共数据约定

| 数据 | 约定 |
| --- | --- |
| `source` | 字符串枚举：`netease`、`qq`、`kuwo`、`url_common`。WS 不接受 `wy`、数字来源或 `db` |
| ID | 一律字符串；歌曲身份为 `(source, id)`，歌曲名不作为主键 |
| 时间戳 | Unix 毫秒整数：`clientTimeMs`、`serverTimeMs`、`sentAtMs`、`startedAtMs` |
| 时长 | `durationMs`，毫秒整数；前端显示和音频 API 使用秒时再除以 1000 |
| 数值 | 不用字符串数字；时间与时长不超过 JS 安全整数上限 `9007199254740991` |
| 空列表 | `[]`，不能为 `null`；空字符串表示元信息缺失 |
| 用户 | `{ name, emailHash }`；`emailHash` 为服务端将邮箱去空格、转小写后的 MD5，未设置时为空字符串；不包含头像 URL |
| 歌曲元信息 `Song` | `{ id, source, name, artist, album, durationMs, pictureUrl, webUrl }` |
| 可播放歌曲 `PlayableSong` | 在 `Song` 基础上增加 `{ url, lyric }`；`lyric` 为 LRC 原文 |
| 队列条目 `QueueItem` | `{ song: Song, user: User, likes: number }` |
| 播放模式 | `sequential` 或 `random`；协议字段统一 `playMode` |

枚举表达协议认识的来源，不保证该来源支持全部操作。目前 provider 注册了网易云、QQ 和通用 URL；`kuwo` 暂无独立 provider，相关请求返回 `PROVIDER_ERROR`，QQ 的内部检索可能产生该来源。`url_common` 通过外部 worker 解析，不能搜索；Bilibili 链接可走该 worker 的通用 URL 能力，`db` 不是本协议的来源。前端应按实际能力显示平台入口，避免把枚举理解为功能承诺。

## 4. 请求目录与旧 action 对照

除注明可选外，表内字段均为必填。完整精度与范围以生成 Schema 为准。

| 旧 action | v1 `type` | 请求 `data` | 成功响应 `data` |
| --- | --- | --- | --- |
| `/heartbeat` | `heartbeat` | `{ clientTimeMs }` | `{ clientTimeMs, serverTimeMs }` |
| `/chat` | `chat.send` | `{ content }`，1–500 字符，纯空白拒绝 | `{}`；另广播 `chat.message` |
| `/setting/user` | `user.update` | `{ name, email, clientTimeMs }`；昵称 1–80 字符，邮箱可为空字符串 | `{ user, clientTimeMs, serverTimeMs }`；另广播成员更新 |
| `/setting/pull` | `settings.get` | `{}` | `{ playMode }` |
| `/music/playmode` | `settings.set` | 部分设置字段，当前为 `{ playMode? }` | `{ playMode }`（全量设置）；另向所有成员广播 `settings.updated` |
| `/house/houseuser` | `members.get` | `{}` | `{ users: User[], onlineCount }` |
| `/music/search` | `music.search` | `{ keyword, source, pageIndex, pageSize }` | `{ items: Song[], totalSize }` |
| `/music/searchsonglist` | `playlist.search` | 同上 | `{ items: Playlist[], totalSize }` |
| `/music/pick` | `music.pick` | `{ source, id?, name? }`；`id`/`name` 至少一个非空 | `{ id, source, name, artist }`；队列更新，进入播放时另广播播放状态 |
| `/music/delete` | `queue.remove` | `{ source, id }`，真实歌曲 ID | `{ source, id }`；另广播队列更新 |
| `/music/good` | `queue.like` | `{ source, id }`，不再使用下标或歌名 | `{ source, id, likes }`；另广播排序后的队列 |
| `/music/skip/vote` | `playback.skipVote` | `{}` | `{ currentVotes, requiredVotes, skipped }` |
| `/music/sync` | `playback.get` | `{}` | `PlaybackData`，见下一节 |
| `/music/playlist`（补齐 WS 入口） | `queue.get` | `{}` | `QueueData`，见下一节 |
| `/music/recommend` | `music.recommend` | `{}` | `{ items: Song[], totalSize }` |

搜索分页：`pageIndex` 从 1 开始、上限 1000000；`pageSize` 为 1–100；关键词 1–500 字符。保留 `music.search` 中 `keyword="*<playlistId>"` 获取歌单歌曲的行为，该操作返回 `Song[]`；当前获取歌单歌曲是全量返回，不能假定会按分页参数截取。歌单 ID 不能传给 `music.pick`，应先取得其歌曲。

`Playlist` 字段：`id`、`source`、`name`、`pictureUrl`、`description`、`creator`、`creatorId`、`playCount`、`songCount`。旧 `desc` 改为 `description`，`creatorUid` 改为 `creatorId`。

`queue.remove` 和 `queue.like` 只操作等待队列，不能删除或点赞当前歌曲、正在准备的歌曲。定位与修改在房间循环内原子执行，队列重排不会改变操作目标。

## 5. 事件、播放与队列快照

| 旧推送 type | v1 事件 | `data` |
| --- | --- | --- |
| `music` | `playback.updated` | `{ song: PlayableSong \| null, user: User \| null, startedAtMs, volumeCoefficient }` |
| `pick` | `queue.updated` | `{ current: QueueItem \| null, items: QueueItem[], onlineCount }` |
| `house_user` | `members.updated` | `{ users: User[], onlineCount }` |
| `chat` | `chat.message` | `{ content, user, sentAtMs }`，时间由服务器生成 |
| `setting/push` | `settings.updated` | `{ playMode }` |
| `info/push` | `notice` | `{ code, message }`，例如后台播放加载失败 |
| 无 | `protocol.error` | `{ code, message }`，不可关联到一个规范请求的协议错误 |

旧 `search`、`searchlist`、`music/recommend`、`playlist` 的查询推送分别改为对应请求的 `response`；旧 `delay` 由 `user.update` / `heartbeat` 的时钟样本替代。旧 `info/push` 的请求失败改为关联响应上的 `error`，不再混入普通通知事件。

进入房间即收到播放、队列、设置、成员快照。客户端最好先注册消息处理器，再创建 WebSocket。当前没有歌曲时仍发送 `playback.updated`，并且 `playback.get` 成功返回：

```json
{ "song": null, "user": null, "startedAtMs": 0, "volumeCoefficient": 1 }
```

`queue.get` 与 `queue.updated` 的载荷相同。`current` 单独保存当前歌曲，`items` 只含等待歌曲；准备中的歌曲尚不在这两个位置。当前歌曲播完、没有下一首时，服务端继续保留最后一首元信息，客户端应按时长停止播放，而不是把非空 `song` 当作“仍在播放”的标志。成员进入或离开时也广播队列快照，以更新 `onlineCount`。

播放同步不再把时钟差与单向网络延迟混称为 `delay`。记录心跳发出时间 `C0`、收到响应时间 `C1`、响应中的 `serverTimeMs=S`：

```ts
const roundTripMs = C1 - C0
const clockOffsetMs = S - (C0 + C1) / 2
const elapsedMs = Date.now() + clockOffsetMs - playback.startedAtMs
const positionSeconds = Math.min(song.durationMs, Math.max(0, elapsedMs)) / 1000
```

这是往返时延近似对称时的时钟偏移估计。多次取样可优先使用往返时延较小的样本；在收到首次样本前可暂用偏移 0。播放开始时间可能领先约 200ms，`elapsedMs < 0` 时应等到开始时间再播放，避免将正常的预推送误判为时钟错误。`volumeCoefficient` 是数值，前端可沿用 0–1.5 的实际音量修正范围，最终写入 `audio.volume` 时仍限制为 0–1。

心跳每 5 秒发送一次，携带本次 `Date.now()`；服务器现在会响应，但**不要仅凭未收到心跳响应就立即重连**。保留现有指数退避重连、回前台/网络恢复自愈逻辑。断线或换房时清空旧请求与时钟样本，重连后重新同步用户和快照。

## 6. 错误码

| `error.code` / 通知 `code` | 含义 |
| --- | --- |
| `INVALID_MESSAGE` | 非法 JSON、消息方向/基础格式错误或非文本帧 |
| `UNSUPPORTED_VERSION` | 缺少协议版本或版本不是 1 |
| `UNKNOWN_TYPE` | 服务端不认识该请求类型 |
| `INVALID_ARGUMENT` | 必填、字段类型、枚举、范围或业务参数不合法 |
| `NOT_FOUND` | 要操作的队列歌曲等资源不存在 |
| `RATE_LIMITED` | 操作过于频繁 |
| `CONFLICT` | 重复点歌、队列已满、重复投票、播放已变化、无下一首等状态冲突 |
| `PROVIDER_ERROR` | 音乐查询/点歌/后台播放加载失败或 provider 不支持该操作 |
| `UNAVAILABLE` | 搜索等待被取消或服务暂不可用 |
| `INTERNAL_ERROR` | 服务端未预期的处理错误 |

音乐搜索/歌单搜索失败已改为失败响应，避免把失败当成成功的空列表。推荐列表仍跳过解析失败的单曲，返回本次成功获得的歌曲，可能是空列表。

## 7. vue-music 按文件迁移

### `src/types/index.ts` 与 `src/types/ws-protocol.ts`

引入生成的协议类型，分别保留 UI 模型与协议模型。现有 UI `Song.title / cover / requestedBy` 在适配层分别映射 `Song.name / pictureUrl / QueueItem.user`。UI `Song.duration` 全程保留毫秒，显示时间或音频定位时转换为秒。

移除旧的 `WebSocketMessage { action: string; data: any; timestamp?; userId? }`，使用 `RequestDataMap`、`ResponseDataMap`、`RequestMessage`、`EventMessage`、`ServerMessage` 等生成类型。示例发送入口：

```ts
import type { RequestDataMap, RequestType } from '@/types/ws-protocol'

function send<T extends RequestType>(type: T, data: RequestDataMap[T]) {
  const requestId = crypto.randomUUID()
  ws.send(JSON.stringify({ version: 1, kind: 'request', type, requestId, data }))
  return requestId
}

send('music.search', {
  source: 'netease',
  keyword: '周杰伦',
  pageIndex: 1,
  pageSize: 20,
})
send('queue.like', { source: 'qq', id: 'song-id' })
```

以上仅展示类型与信封；实际 Store 需保留 `readyState` 检查，并维护 `requestId -> 请求类型/回调/发送时间`。先登记待处理请求再写入 socket，写入失败时清理该项。

### `src/stores/websocket-store.ts`

- URL 使用 `URLSearchParams` 或分别编码房间 ID/密码。发送入口统一生成版本、方向、关联 ID，删除自动追加的顶层 `timestamp`。
- 先检查 `version` 与 `kind`。`response` 按 `requestId` 查找请求，检查 `type` 一致，再根据 `error` resolve/reject；`event` 再按事件类型路由。
- 事件与响应分开注册，不能只根据 `type` 把两者混在一个 handler 中。加入处理 `protocol.error` 和失败响应的通知入口。
- 把心跳改为 `heartbeat / { clientTimeMs: Date.now() }`，保存发送时间以更新时钟偏移。不要让心跳的 pending 项无限累积。
- 待处理请求设超时，业务查询可能受搜索限流影响，服务端单次请求处理上下文为 3 分钟；客户端超时后不要自动重放写操作。断线时拒绝并清理全部 pending。
- `sendSongLike`、`sendDeleteSong` 改为接收 `{ id, source }`；旧 `index/name/songName` 不再传入服务端。
- 聊天中的“点歌”命令改用 `music.pick`：关键词固定 `netease`，通用 URL 使用 `url_common`；`db`、`wy`、BV/av 等历史遗留分支一律删除，不再兼容。

### `src/stores/player-store.ts`

- `music -> playback.updated`：取 `message.data.song`，处理 `null`，并使用 `startedAtMs`、`volumeCoefficient`、`song.lyric`；`playback.get` 响应复用同一个状态应用函数。
- `pick -> queue.updated`：保留 `current` 与 `items` 的区分。若 UI 需要将当前歌曲显示在第一行，可在视图层组合；点赞/删除仍发送具体条目的 `song.id + song.source`。
- 修复旧队列映射的 `duration / 1000`：UI `Song.duration` 应设为 `song.durationMs`，与当前播放、历史统计保持同一单位。不要再使用 `240` 作为毫秒字段的默认值。
- `music.recommend` 从事件改为请求响应，取 `data.items`；保留每首歌曲的 `source`，点歌时不能盲目使用当前搜索平台。
- 移除 `delay` handler，使用心跳样本估计 `clockOffsetMs`；将同步公式替换为第 5 节的公式。
- 请求失败统一走响应错误；后台通知订阅 `notice`。请求失败与通知事件不要重复弹 Toast。

### `src/stores/search-store.ts` 与搜索弹窗

- `search/searchlist` 改为 `music.search/playlist.search` 的响应，取 `data.items` 和 `data.totalSize`，封面统一 `pictureUrl`。
- 搜索结果必须保留 `id/source/durationMs`，避免推荐和多来源结果点错平台。歌单结果保留 `source/creator/songCount`。
- 模态框请求类型由新表选择；失败响应也结束 `isSearching`，显示 `error.message`。
- 快速搜索或切页时，以最近一次 `requestId` 决定是否应用结果，防止晚到的旧查询覆盖新查询。

### `src/stores/chat-store.ts` 与 `src/utils/user.ts`

- 聊天订阅 `chat.message`，读取 `data.content / data.sentAtMs / data.user`，发送不再携带 `sendTime`。
- 成员订阅 `members.updated`，读取 `data.users`；`members.get` 响应复用成员更新函数。
- 用户头像工具改读 `emailHash`；或者在 UI 适配层将其映射到旧 `email` 字段后调用 `processUser`。无哈希时由前端生成默认头像，协议不提供 `avatar`。

### `src/stores/user-settings-store.ts`

- `setting/push -> settings.updated`，字段 `playmode -> playMode`；`settings.get` 响应复用相同逻辑。
- 用户同步请求改为 `user.update / { name, email, clientTimeMs }`，响应中的 `user` 是服务器确认的显示身份，邮箱传原文，返回 `emailHash`。
- 切换模式发送 `settings.set / { playMode }`，处理确认或失败响应；其他用户从广播获得新模式。

### 队列组件、布局与 `src/app-element.ts`

`song-like` 当前上报 `index/title`，`song-delete` 当前上报 `songName`。从队列条目开始，沿组件、布局、根组件整条事件链改为传递 `{ id, source }`，否则只改 websocketStore 仍会缺少真实 ID。当前播放行禁止点赞/删除；等待列表可按 `(source,id)` 生成稳定 key。

## 8. 联调清单与后续规范

前端修改后至少运行 `npm run type-check`、`npm run lint`，并验证：空房间加入、用户头像、聊天、搜索失败恢复、歌单歌曲查询、跨来源推荐点歌、同名歌曲删除、点赞后重排、多人切换模式、投票与重复投票、后台回前台、断网重连和换房清理 pending。

本次服务端验证覆盖：

- `go test ./...`：完整 Go 测试。
- `go run ./cmd/protocolgen -check`：IDL 与生成文件一致性；生成的 TypeScript 文件通过严格类型检查。
- WS 端到端：加入快照、心跳时钟样本、用户更新、聊天、设置广播、播放同步、队列查询/点赞/删除/切歌、推荐、provider 错误及旧格式拒绝；对收到的每条消息执行完整 Schema 校验并检查响应关联 ID。
- 协议测试：非法 JSON/版本/类型/方向、必填和未知字段、数字来源和 `wy`、时间整数与安全范围、分页、聊天长度、空列表、失败信封。

后续新增/修改协议时：

1. 先编辑 `protocol/ws.idl.json`。新增 DTO 放 `$defs`，新增请求/事件登记在 `x-requests` / `x-events`；`legacyAction` 只是迁移索引，不启用旧协议。
2. DTO 必须明确必填项、枚举、时间单位、空值含义；保持 `additionalProperties: false`。字段名使用 lowerCamelCase，毫秒字段使用 `Ms` 后缀，业务状态不得藏在文案里。
3. 运行生成命令，提交 IDL 与三个生成文件；运行 `-check` 防止忘记生成。生成器对尚不支持的 DTO 字段结构会直接报错，应扩展生成器后再使用，不得手改生成文件。
4. 为新请求在 `cmd/alisten/main.go` 的路由表接入 handler；广播统一构造 `protocol.Event(...)`，响应统一经 `Request.Send(...)`，失败使用标准错误码。
5. 在 handler/领域模型边界转换 DTO；不要将 provider 的数值来源或 HTTP 旧结构直接广播。新增响应/事件必须增加契约与联调覆盖。
6. 前端同步生成 TS 类型，更新相关 Store 与本文。严格 Schema 下，即使增加可选字段也要考虑旧客户端校验器的兼容；变更字段语义、必填项、名称、单位或删除枚举等破坏性更改，应升级协议版本并明确部署兼容策略。

本轮没有实现旧 WS 格式兼容层、协议协商、请求重放或新的音乐 provider。部署时应协调前后端切换版本。
