import type { RoomInfo } from '@/types'
import { Headphones, LockKeyhole, Plus, Search, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { notificationStore } from '@/stores/notification-store'
import { createRoom, searchRooms } from '@/utils/api'
import { getLastJoinedRoom, getSavedRoomPassword } from '@/utils/user'
import { EmptyState, Modal, Skeleton } from './ui'

export default function RoomBrowser({
  onJoin,
  joined,
}: {
  onJoin: (room: RoomInfo, password?: string) => void
  joined: boolean
}) {
  const [query, setQuery] = useState('')
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [selected, setSelected] = useState<RoomInfo | null>(null)
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const autoSelected = useRef(joined)
  const select = (room: RoomInfo) => {
    setPassword(room.needPwd ? getSavedRoomPassword(room.id) || '' : '')
    setSelected(room)
  }
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(
      async () => {
        setLoading(true)
        setError('')
        try {
          const data = await searchRooms(
            query.trim() || undefined,
            controller.signal,
          )
          if (controller.signal.aborted)
            return
          setRooms(data)
          if (!autoSelected.current) {
            autoSelected.current = true
            const params = new URLSearchParams(window.location.search)
            const invitationId
              = params.get('houseId')
                || params.get('houseid')
                || params.get('HOUSEID')
            const id = invitationId || getLastJoinedRoom()
            const room = data.find(r => r.id === id)
            if (room) {
              const invitationPassword
                = params.get('housePwd')
                  || params.get('housepwd')
                  || params.get('HOUSEPWD')
              setPassword(
                room.needPwd
                  ? invitationPassword || getSavedRoomPassword(room.id) || ''
                  : '',
              )
              setSelected(room)
            }
          }
        } catch (err) {
          if (!controller.signal.aborted)
            setError(err instanceof Error ? err.message : '无法加载房间')
        } finally {
          if (!controller.signal.aborted)
            setLoading(false)
        }
      },
      query ? 300 : 0,
    )
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, retry])
  return (
    <div className="page-content room-page">
      <div className="page-title">
        <span className="text-ui-sm accent">壁画音乐厅</span>
        <h1 className="text-ui-xl">好音乐，值得一起听。</h1>
        <p className="text-ui-base muted">
          找到你的听歌房，与同频的人分享此刻。
        </p>
      </div>
      <div className="room-toolbar">
        <label className="search-field">
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="搜索房间"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索房间名称或介绍"
          />
        </label>
        <button
          type="button"
          className="button-primary"
          onClick={() => setCreating(true)}
        >
          <Plus size={18} />
          创建房间
        </button>
      </div>
      <div className="section-heading">
        <h2 className="text-ui-lg">正在发生的音乐</h2>
        <span className="muted text-ui-sm">
          {loading ? '正在寻找房间' : `${rooms.length} 个房间`}
        </span>
      </div>
      {loading
        ? (
            <Skeleton rows={5} />
          )
        : error
          ? (
              <EmptyState
                title="暂时无法获取房间"
                action={(
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setRetry(n => n + 1)}
                  >
                    重新加载
                  </button>
                )}
              >
                请检查网络连接后重试。
              </EmptyState>
            )
          : !rooms.length
              ? (
                  <EmptyState
                    icon={Headphones}
                    title={query ? '没有找到这个房间' : '成为第一个开房的人'}
                    action={(
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => setCreating(true)}
                      >
                        创建听歌房
                      </button>
                    )}
                  >
                    {query
                      ? '换个关键词，再找找看。'
                      : '创建一个房间，邀请朋友一起听歌。'}
                  </EmptyState>
                )
              : (
                  <div className="room-grid">
                    {rooms.map(room => (
                      <button
                        type="button"
                        className="room-card"
                        key={room.id}
                        onClick={() => select(room)}
                      >
                        <div className="room-art">
                          <Headphones size={48} strokeWidth={1.2} aria-hidden="true" />
                        </div>
                        <div className="room-card-copy">
                          <div className="room-name">
                            <h3 className="text-ui-lg">{room.name}</h3>
                            {room.needPwd && (
                              <LockKeyhole size={14} aria-label="需要密码" />
                            )}
                          </div>
                          <p className="text-ui-caption muted">
                            {room.description || '来这里，听见好音乐。'}
                          </p>
                          <span className="text-ui-sm muted">
                            <Users size={14} />
                            {room.population}
                            {' '}
                            人正在听
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
      {selected && (
        <Modal title="加入听歌房" onClose={() => setSelected(null)}>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault()
              onJoin(selected, selected.needPwd ? password.trim() : undefined)
              setSelected(null)
            }}
          >
            <div className="join-summary">
              <Headphones size={32} className="accent" />
              <h3 className="text-ui-lg">{selected.name}</h3>
              <p className="text-ui-caption muted">{selected.description}</p>
            </div>
            {selected.needPwd && (
              <label>
                房间密码
                <input
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="输入房间密码"
                />
              </label>
            )}
            <p className="text-ui-caption muted">
              加入后，与房间内的所有人同步播放、点歌和聊天。
            </p>
            <button
              type="submit"
              className="button-primary"
              disabled={selected.needPwd && !password.trim()}
            >
              加入房间
            </button>
          </form>
        </Modal>
      )}
      {creating && (
        <CreateRoom onClose={() => setCreating(false)} onJoin={onJoin} />
      )}
    </div>
  )
}

function CreateRoom({
  onClose,
  onJoin,
}: {
  onClose: () => void
  onJoin: (room: RoomInfo, password?: string) => void
}) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [locked, setLocked] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async () => {
    if (busy || !name.trim() || (locked && !password.trim()))
      return
    setBusy(true)
    setError('')
    try {
      const response = await createRoom({
        name: name.trim(),
        desc: desc.trim(),
        needPwd: locked,
        password: locked ? password.trim() : '',
      })
      if (response.code !== '20000' || !response.data)
        throw new Error(response.message || '创建失败')
      onJoin(
        {
          id: response.data,
          name: name.trim(),
          description: desc.trim(),
          needPwd: locked,
          population: 1,
          ultimate: false,
        },
        locked ? password.trim() : undefined,
      )
      notificationStore.success('房间已创建')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败，请重试')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Modal title="创建新房间" onClose={onClose}>
      <form
        className="form-stack"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <label>
          房间名称
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={50}
            placeholder="给这个房间起个名字"
          />
        </label>
        <label>
          房间描述
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="你想和大家听什么？"
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={locked}
            onChange={e => setLocked(e.target.checked)}
          />
          设置房间密码
        </label>
        {locked && (
          <label>
            房间密码
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
        )}
        {error && (
          <p role="alert" className="error-text text-ui-caption">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="button-primary"
          disabled={busy || !name.trim() || (locked && !password.trim())}
        >
          {busy ? '正在创建…' : '创建并加入'}
        </button>
      </form>
    </Modal>
  )
}
