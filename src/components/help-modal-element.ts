import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { icons } from '@/utils/icons'

@customElement('alisten-help-modal')
export class HelpModalElement extends LitElement {
  createRenderRoot() {
    return this
  }

  render() {
    return html`
      <alisten-modal title="使用帮助" headerIcon="fa-solid fa-question-circle" .open=${true} @close=${() => this.dispatchEvent(new CustomEvent('close'))}>
        <div class="space-y-4 text-sm text-white/70">
          <div class="rounded-xl p-4">
            <h4 class="font-bold text-white mb-2 flex items-center gap-2">
              ${unsafeSVG(icons.music(16, 'text-[var(--accent)]'))}
              点歌
            </h4>
            <p>点击播放列表下方的"点歌"按钮搜索并添加歌曲。支持网易云音乐、QQ音乐、B站等平台。</p>
          </div>
          <div class="rounded-xl p-4">
            <h4 class="font-bold text-white mb-2 flex items-center gap-2">
              ${unsafeSVG(icons.messageSquare(16, 'text-[var(--accent)]'))}
              聊天
            </h4>
            <p>在聊天面板输入消息并回车发送。支持发送表情和快捷命令。</p>
          </div>
          <div class="rounded-xl p-4">
            <h4 class="font-bold text-white mb-2 flex items-center gap-2">
              ${unsafeSVG(icons.settings(16, 'text-green-400'))}
              设置
            </h4>
            <p>在设置中可以修改昵称、邮箱（用于头像）、音量、性能模式等。</p>
          </div>
          <div class="rounded-xl p-4">
            <h4 class="font-bold text-white mb-2 flex items-center gap-2">
              ${unsafeSVG(icons.share2(16, 'text-[var(--accent)]'))}
              分享
            </h4>
            <p>点击分享按钮复制房间链接，邀请好友一起听歌。</p>
          </div>
        </div>
      </alisten-modal>
    `
  }
}
