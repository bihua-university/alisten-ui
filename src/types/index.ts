export interface Song {
  id?: string
  title: string
  artist: string
  album?: string
  cover: string
  url?: string
  duration: number
  requestedBy?: User
}

// 只读版本的 Song，用于防止直接修改
export type ReadonlySong = Readonly<Omit<Song, 'likedBy'>> & { readonly likedBy: readonly number[] }

export interface User {
  name: string
  avatar: string
}

export interface ChatMessage {
  content: string
  timestamp: number
  user: User
}

export interface RoomInfo {
  id: string
  name: string
  creator: string
}

export interface LyricLine {
  text: string
  time: number
}

export interface MusicSource {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export interface SearchResult extends Song {
  originalId: string
  previewUrl?: string
}

export interface WebSocketMessage {
  action: string
  data: any
  timestamp?: number
  userId?: number
}

export interface WebSocketConfig {
  url: string
  reconnectAttempts: number
  reconnectInterval: number
  heartbeatInterval: number
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting'

export interface RoomState {
  currentTime: number
  currentSong: Song | null
  pushTime: number | null
  playlist: Song[]
  onlineUsers: User[]
  chatMessages: ChatMessage[]
  searchResults: SearchResult[]
  currentLyrics: LyricLine[]
  currentLyricIndex: number
}
