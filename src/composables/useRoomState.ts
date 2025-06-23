import { computed, reactive } from 'vue'
import type { RoomState, User, ChatMessage, SearchResult, Song, LyricLine } from '@/types'

// 全局共享的房间状态
const roomState = reactive<RoomState>({
  currentTime: 0,
  currentSong: null,
  pushTime: null,
  playlist: [],
  onlineUsers: [],
  chatMessages: [],
  searchResults: [],
  currentLyrics: [],
  currentLyricIndex: 0
})

export const useRoomState = () => {
  // 当前歌曲相关
  const setCurrentSong = (song: Song | null) => {
    roomState.currentSong = song
  }

  const setPushTime = (time: number | null) => {
    roomState.pushTime = time
  }

  const setCurrentTime = (time: number) => {
    roomState.currentTime = time
  }

  // 更新播放状态和时间（用于服务器同步）
  const updatePlayState = (currentTime: number, pushTime?: number) => {
    roomState.currentTime = currentTime
    if (pushTime !== undefined) {
      roomState.pushTime = pushTime
    } else {
      // 如果没有提供pushTime，使用当前时间
      roomState.pushTime = Date.now()
    }
  }

  // 播放列表相关
  const updatePlaylist = (playlist: any[]) => {
    roomState.playlist = [...playlist]
  }

  const clearPlaylist = () => {
    roomState.playlist = []
    setCurrentSong(null)
  }

  // 在线用户相关
  const addUser = (user: User) => {
    const exists = roomState.onlineUsers.find(u => u.id === user.id)
    if (!exists) {
      roomState.onlineUsers.push(user)
    }
  }

  const removeUser = (userId: number) => {
    const index = roomState.onlineUsers.findIndex(u => u.id === userId)
    if (index > -1) {
      roomState.onlineUsers.splice(index, 1)
    }
  }

  const updateOnlineUsers = (users: User[]) => {
    roomState.onlineUsers = [...users]
  }

  // 聊天消息相关
  const addChatMessage = (message: ChatMessage) => {
    roomState.chatMessages.push(message)
  }
  const clearChatMessages = () => {
    roomState.chatMessages = []
  }

  // 搜索结果相关
  const updateSearchResults = (results: SearchResult[]) => {
    roomState.searchResults = [...results]
  }
  const clearSearchResults = () => {
    roomState.searchResults = []
  }

  // 歌词相关
  const setCurrentLyrics = (lyrics: LyricLine[]) => {
    roomState.currentLyrics = [...lyrics]
  }

  const setCurrentLyricIndex = (index: number) => {
    roomState.currentLyricIndex = index
  }

  const clearLyrics = () => {
    roomState.currentLyrics = []
    roomState.currentLyricIndex = 0
  }  // 重置整个房间状态
  const resetRoomState = () => {
    roomState.currentTime = 0
    roomState.currentSong = null
    roomState.pushTime = null
    roomState.playlist = []
    roomState.onlineUsers = []
    roomState.chatMessages = []
    roomState.searchResults = []
    roomState.currentLyrics = []
    roomState.currentLyricIndex = 0
  }  // 计算属性
  const playlistCount = computed(() => roomState.playlist.length)
  const onlineUserCount = computed(() => roomState.onlineUsers.length)
  const chatMessageCount = computed(() => roomState.chatMessages.length)
  const searchResultCount = computed(() => roomState.searchResults.length)
  const lyricsCount = computed(() => roomState.currentLyrics.length)
  return {
    roomState,
    
    // 当前歌曲操作
    setCurrentSong,
    setPushTime,
    setCurrentTime,
    updatePlayState,
    
    // 播放列表操作
    updatePlaylist,
    clearPlaylist,
    
    // 用户操作
    addUser,
    removeUser,
    updateOnlineUsers,
    
    // 聊天操作
    addChatMessage,
    clearChatMessages,
      // 搜索结果操作
    updateSearchResults,
    clearSearchResults,
    
    // 歌词操作
    setCurrentLyrics,
    setCurrentLyricIndex,
    clearLyrics,
    
    // 其他操作
    resetRoomState,
      // 计算属性
    playlistCount,
    onlineUserCount,
    chatMessageCount,
    searchResultCount,
    lyricsCount,
  }
}
