// 应用配置管理
export interface AppConfig {
  websocket: {
    url: string
    reconnectAttempts: number
    reconnectInterval: number
    heartbeatInterval: number
  }
  api: {
    baseUrl: string
  }
  app: {
    name: string
    version: string
  }
}

// 默认配置
const defaultConfig: AppConfig = {
  websocket: {
    url: 'ws://localhost:8080',
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    heartbeatInterval: 30000
  },
  api: {
    baseUrl: 'http://localhost:8080'
  },
  app: {
    name: '音乐共享房间',
    version: '1.0.0'
  }
}

// 从环境变量获取配置
export const getAppConfig = (): AppConfig => {
  return {
    websocket: {
      url: import.meta.env.VITE_WS_URL || defaultConfig.websocket.url,
      reconnectAttempts: defaultConfig.websocket.reconnectAttempts,
      reconnectInterval: defaultConfig.websocket.reconnectInterval,
      heartbeatInterval: defaultConfig.websocket.heartbeatInterval
    },
    api: {
      baseUrl: import.meta.env.VITE_API_URL || defaultConfig.api.baseUrl
    },
    app: {
      name: import.meta.env.VITE_APP_NAME || defaultConfig.app.name,
      version: defaultConfig.app.version
    }
  }
}

// 验证配置
export const validateConfig = (config: AppConfig): string[] => {
  const errors: string[] = []
  
  if (!config.websocket.url) {
    errors.push('WebSocket URL 未配置')
  }
  
  if (!config.websocket.url.startsWith('ws://') && !config.websocket.url.startsWith('wss://')) {
    errors.push('WebSocket URL 格式错误，必须以 ws:// 或 wss:// 开头')
  }
  
  if (!config.api.baseUrl) {
    errors.push('API 基础URL 未配置')
  }
  
  if (config.websocket.reconnectAttempts < 0) {
    errors.push('重连次数不能小于0')
  }
  
  if (config.websocket.reconnectInterval < 1000) {
    errors.push('重连间隔不能小于1000毫秒')
  }
  
  return errors
}

// 打印配置信息（开发环境）
export const logConfig = (config: AppConfig) => {
  if (import.meta.env.DEV) {
    console.group('🔧 应用配置')
    console.log('WebSocket URL:', config.websocket.url)
    console.log('API URL:', config.api.baseUrl)
    console.log('应用名称:', config.app.name)
    console.log('重连设置:', {
      attempts: config.websocket.reconnectAttempts,
      interval: config.websocket.reconnectInterval
    })
    console.groupEnd()
  }
}
