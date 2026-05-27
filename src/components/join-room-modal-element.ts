import type { RoomInfo } from '@/types'
import { html, LitElement, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { notificationStore } from '@/stores/notification-store'
import { roomStore } from '@/stores/room-store'
import { createRoom, searchRooms } from '@/utils/api'
import { icons } from '@/utils/icons'
import { getLastJoinedRoom, getSavedRoomPassword, saveLastJoinedRoom, saveRoomPassword } from '@/utils/user'

@customElement('alisten-join-room-modal')
export class JoinRoomModalElement extends LitElement {
  createRenderRoot() {
    return this
  }

  @state() private searchKeyword = ''
  @state() private isSearching = false
  @state() private allRooms: RoomInfo[] = []
  @state() private selectedRoomId = ''
  @state() private showConfirm = false
  @state() private showCreate = false
  @state() private confirmPassword = ''
  @state() private isCreatingRoom = false
  @state() private createName = ''
  @state() private createDesc = ''
  @state() private createEnablePassword = false
  @state() private createPassword = ''

  private searchTimeout: ReturnType<typeof setTimeout> | null = null

  connectedCallback() {
    super.connectedCallback()
    this.loadRooms()
  }

  private async loadRooms() {
    try {
      this.isSearching = true
      const response = await searchRooms(this.searchKeyword.trim() || undefined)
      this.allRooms = response || []
      this.handleAutoSelect()
    } catch (error) {
      console.error('加载房间列表失败:', error)
      this.allRooms = []
      notificationStore.error('加载房间列表失败，请检查网络连接后重试')
    } finally {
      this.isSearching = false
    }
  }

  private handleAutoSelect() {
    if (this.selectedRoomId)
      return

    const urlParams = new URLSearchParams(window.location.search)
    const houseIdFromUrl = urlParams.get('houseId') || urlParams.get('houseid') || urlParams.get('HOUSEID')
    const housePwdFromUrl = urlParams.get('housePwd') || urlParams.get('housepwd') || urlParams.get('HOUSEPWD')

    if (houseIdFromUrl) {
      let autoPassword = housePwdFromUrl
      if (!autoPassword) {
        const savedPassword = getSavedRoomPassword(houseIdFromUrl)
        if (savedPassword)
          autoPassword = savedPassword
      }

      if (autoPassword) {
        this.selectedRoomId = houseIdFromUrl
        this.confirmPassword = autoPassword
        this.handleConfirm()
        return
      }

      if (this.allRooms.some(r => r.id === houseIdFromUrl)) {
        this.selectRoom(this.allRooms.find(r => r.id === houseIdFromUrl)!)
        return
      }
    }

    const lastRoomId = getLastJoinedRoom()
    if (lastRoomId && this.allRooms.some(r => r.id === lastRoomId)) {
      this.selectRoom(this.allRooms.find(r => r.id === lastRoomId)!)
    }
  }

  private handleSearch() {
    if (this.searchTimeout)
      clearTimeout(this.searchTimeout)
    this.searchTimeout = setTimeout(() => this.loadRooms(), 300)
  }

  private get selectedRoom(): RoomInfo | null {
    return this.allRooms.find(r => r.id === this.selectedRoomId) || null
  }

  private get filteredRooms(): RoomInfo[] {
    if (!this.searchKeyword.trim())
      return this.allRooms
    const keyword = this.searchKeyword.toLowerCase()
    return this.allRooms.filter(r =>
      r.name.toLowerCase().includes(keyword)
      || (r.description && r.description.toLowerCase().includes(keyword)),
    )
  }

  private selectRoom(room: RoomInfo) {
    this.selectedRoomId = room.id
    if (room.needPwd) {
      const saved = getSavedRoomPassword(room.id)
      this.confirmPassword = saved || ''
    } else {
      this.confirmPassword = ''
    }
    this.showConfirm = true
  }

  private handleConfirm() {
    const room = this.selectedRoom
    if (!room)
      return
    if (room.needPwd && !this.confirmPassword.trim())
      return

    if (room.needPwd && this.confirmPassword.trim())
      saveRoomPassword(room.id, this.confirmPassword.trim())
    saveLastJoinedRoom(room.id)
    roomStore.updateRoomInfo(room)
    roomStore.setCurrentPassword(room.needPwd ? this.confirmPassword.trim() : undefined)

    this.dispatchEvent(new CustomEvent('confirm', {
      detail: { roomId: room.id, password: room.needPwd ? this.confirmPassword.trim() : undefined },
    }))
  }

  private handleCancel() {
    if (this.showConfirm) {
      this.showConfirm = false
      this.confirmPassword = ''
    } else {
      this.dispatchEvent(new CustomEvent('cancel'))
    }
  }

  private async handleCreateRoom() {
    if (!this.createName.trim() || this.isCreatingRoom)
      return

    try {
      this.isCreatingRoom = true
      const response = await createRoom({
        name: this.createName.trim(),
        desc: this.createDesc.trim(),
        needPwd: this.createEnablePassword,
        password: this.createEnablePassword ? this.createPassword.trim() : '',
      })

      if (response.code === '20000' && response.data) {
        const newRoomId = response.data
        if (this.createEnablePassword && this.createPassword.trim())
          saveRoomPassword(newRoomId, this.createPassword.trim())
        saveLastJoinedRoom(newRoomId)
        roomStore.updateRoomInfo({
          id: newRoomId,
          name: this.createName.trim(),
          description: this.createDesc.trim(),
          population: 1,
          needPwd: this.createEnablePassword,
          ultimate: false,
        })
        roomStore.setCurrentPassword(this.createEnablePassword ? this.createPassword.trim() : undefined)

        notificationStore.success(response.message || `房间 "${this.createName.trim()}" 创建成功`)
        this.dispatchEvent(new CustomEvent('confirm', {
          detail: { roomId: newRoomId, password: this.createEnablePassword ? this.createPassword.trim() : undefined },
        }))
      } else {
        notificationStore.error(response.message || '创建房间失败')
      }
    } catch (error) {
      console.error('创建房间失败:', error)
      notificationStore.error('创建房间失败，请检查网络连接')
    } finally {
      this.isCreatingRoom = false
    }
  }

  render() {
    if (this.showCreate)
      return this.renderCreateDialog()
    if (this.showConfirm)
      return this.renderConfirmDialog()
    return this.renderRoomList()
  }

  private renderRoomList() {
    return html`
      <alisten-modal title="选择房间" subtitle="选择或搜索要加入的音乐房间" headerIcon="fa-solid fa-music"
        size="md" .open=${true} .allowBackdropClose=${false} @close=${this.handleCancel}>
        <div class="space-y-4">
          <!-- Search and Create -->
          <div class="flex gap-3">
            <div class="relative flex-1">
              <input type="text" .value=${this.searchKeyword} placeholder="搜索房间名称..."
                class="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[var(--accent)]/30 focus:bg-white/[0.06] transition-all"
                @input=${(e: InputEvent) => {
                  this.searchKeyword = (e.target as HTMLInputElement).value
                  this.handleSearch()
                }}>
              ${unsafeSVG(icons.search(16, 'absolute left-3 top-1/2 -translate-y-1/2 text-white/35'))}
            </div>
            <button class="bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 text-white rounded-xl px-4 py-3 transition-all  flex items-center gap-2 whitespace-nowrap text-sm font-medium"
              @click=${() => {
                this.showCreate = true
              }}>
              ${unsafeSVG(icons.plus(16))}
              创建房间
            </button>
          </div>

          <!-- Room List -->
          <div class="max-h-72 overflow-y-auto space-y-2">
            ${this.isSearching
              ? html`
              <div class="text-center py-8 text-white/35">
                <div class="w-8 h-8 border-2 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-sm">正在搜索房间...</p>
              </div>
            `
              : this.filteredRooms.length === 0
                ? html`
              <div class="text-center py-8 text-white/35">
                ${unsafeSVG(icons.search(32, 'mx-auto mb-2 opacity-50'))}
                <p class="text-sm">${this.searchKeyword ? '未找到匹配的房间' : '暂无可用房间'}</p>
              </div>
            `
                : this.filteredRooms.map(room => html`
              <div class="group p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer border border-transparent
                ${this.selectedRoomId === room.id ? 'bg-[var(--accent)]/10 border-[var(--accent)]/30' : ''}"
                @click=${() => this.selectRoom(room)}>
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center mb-1">
                      <span class="font-semibold text-white text-sm truncate">${room.name}</span>
                      ${room.needPwd
                        ? html`
                        <span class="ml-2 text-white/35" title="需要密码">
                          ${unsafeSVG(icons.lock(12))}
                        </span>
                      `
                        : nothing}
                    </div>
                    <div class="flex items-center text-xs text-white/35">
                      <span class="flex items-center mr-3">
                        ${unsafeSVG(icons.users(12, 'mr-1 text-white/25'))}
                        ${room.population} 人
                      </span>
                      <span class="truncate">${room.description || '暂无简介'}</span>
                    </div>
                  </div>
                  <div class="ml-3 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                    ${this.selectedRoomId === room.id ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-white/20'}">
                    ${this.selectedRoomId === room.id ? unsafeSVG(icons.checkCircle(14, 'text-white')) : nothing}
                  </div>
                </div>
              </div>
            `)}
          </div>

          <p class="text-xs text-white/25 text-center">点击房间即可加入，与其他用户一起听歌互动</p>
        </div>
      </alisten-modal>
    `
  }

  private renderConfirmDialog() {
    const room = this.selectedRoom
    if (!room)
      return nothing

    return html`
      <alisten-modal title="确认加入房间" headerIcon="fa-solid fa-music" size="sm"
        .open=${true} @close=${() => {
          this.showConfirm = false
        }}>
        <div class="rounded-xl p-4 mb-4 bg-white/[0.03]">
          <div class="flex items-center mb-3">
            <div class="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center mr-3">
              ${unsafeSVG(icons.logIn(20, 'text-[var(--accent)]'))}
            </div>
            <div class="flex-1 min-w-0">
              <span class="font-semibold text-white text-sm block truncate">${room.name}</span>
              ${room.needPwd
                ? html`
                <span class="text-white/35 text-xs flex items-center gap-1 mt-0.5">
                  ${unsafeSVG(icons.lock(10))}
                  需要密码
                </span>
              `
                : nothing}
            </div>
          </div>
          <div class="flex items-center gap-4 text-xs text-white/35">
            <span class="flex items-center">
              ${unsafeSVG(icons.users(12, 'mr-1'))}
              ${room.population} 人在线
            </span>
            <span class="truncate">${room.description || '暂无简介'}</span>
          </div>
        </div>

        ${room.needPwd
          ? html`
          <div class="mb-4">
            <input type="password" .value=${this.confirmPassword} placeholder="请输入房间密码"
              class="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]/30 transition-all"
              @input=${(e: InputEvent) => this.confirmPassword = (e.target as HTMLInputElement).value}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'Enter')
                  this.handleConfirm()
              }}>
          </div>
        `
          : nothing}

        <p class="text-sm text-white/35 mb-4 text-center">加入后您将与其他用户一起听歌、聊天和互动</p>

        <div class="flex gap-3">
          <button class="flex-1 bg-white/[0.04] hover:bg-white/[0.06] active:scale-95 text-white rounded-xl py-3 transition-all border border-white/[0.06] font-medium"
            @click=${this.handleCancel}>取消</button>
          <button class="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 text-white rounded-xl py-3 transition-all  font-medium
            ${room.needPwd && !this.confirmPassword.trim() ? 'opacity-50 cursor-not-allowed' : ''}"
            ?disabled=${room.needPwd && !this.confirmPassword.trim()}
            @click=${this.handleConfirm}>
            加入房间
          </button>
        </div>
      </alisten-modal>
    `
  }

  private renderCreateDialog() {
    return html`
      <alisten-modal title="创建新房间" subtitle="创建属于您的音乐房间" headerIcon="fa-solid fa-plus"
        theme="success" size="md" .open=${true} @close=${() => {
          this.showCreate = false
        }}>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-white/50">房间名称 *</label>
            <input type="text" .value=${this.createName} placeholder="请输入房间名称"
              class="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]/30 transition-all"
              maxlength="50"
              @input=${(e: InputEvent) => this.createName = (e.target as HTMLInputElement).value}
              @keydown=${(e: KeyboardEvent) => {
                if (e.key === 'Enter')
                  this.handleCreateRoom()
              }}>
            <div class="text-xs text-white/25 mt-1 text-right">${this.createName.length}/50</div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2 text-white/50">房间描述</label>
            <textarea .value=${this.createDesc} placeholder="请输入房间描述（可选）"
              class="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]/30 transition-all resize-none"
              rows="3" maxlength="200"
              @input=${(e: InputEvent) => this.createDesc = (e.target as HTMLInputElement).value}></textarea>
            <div class="text-xs text-white/25 mt-1 text-right">${this.createDesc.length}/200</div>
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-sm font-medium text-white/50">房间密码</label>
              <button type="button" class="text-xs text-[var(--accent)] hover:text-[#E8C87A] transition-colors"
                @click=${() => {
                  this.createEnablePassword = !this.createEnablePassword
                }}>
                ${this.createEnablePassword ? '取消密码' : '设置密码'}
              </button>
            </div>
            ${this.createEnablePassword
              ? html`
              <input type="password" .value=${this.createPassword} placeholder="请输入房间密码"
                class="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent)]/30 transition-all"
                @input=${(e: InputEvent) => this.createPassword = (e.target as HTMLInputElement).value}
                @keydown=${(e: KeyboardEvent) => {
                  if (e.key === 'Enter')
                    this.handleCreateRoom()
                }}>
            `
              : html`
              <div class="text-sm text-white/35 flex items-center rounded-xl p-3 bg-white/[0.03]">
                ${unsafeSVG(icons.info(14, 'mr-2'))}
                房间将对所有人开放，无需密码即可加入
              </div>
            `}
          </div>

          <div class="flex gap-3 pt-2">
            <button class="flex-1 bg-white/[0.04] hover:bg-white/[0.06] active:scale-95 text-white rounded-xl py-3 transition-all border border-white/[0.06] font-medium"
              @click=${() => {
                this.showCreate = false
              }}>取消</button>
            <button class="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95 text-white rounded-xl py-3 transition-all  font-medium
              ${!this.createName.trim() || this.isCreatingRoom ? 'opacity-50 cursor-not-allowed' : ''}"
              ?disabled=${!this.createName.trim() || this.isCreatingRoom}
              @click=${this.handleCreateRoom}>
              ${this.isCreatingRoom ? '创建中...' : '创建房间'}
            </button>
          </div>
        </div>
      </alisten-modal>
    `
  }
}
