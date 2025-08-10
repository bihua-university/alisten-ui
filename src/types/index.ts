export interface Song {
  id?: string
  title: string
  artist: string
  album?: string
  cover: string
  url?: string
  webUrl?: string
  duration: number
  requestedBy?: User
  source?: string
}

export interface User {
  name: string
  email?: string
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
  description: string
  population: number
  needPwd: boolean
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

export type PlayMode = 'sequential' | 'random'
