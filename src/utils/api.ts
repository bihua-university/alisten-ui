import type { RoomInfo } from '@/types'
import { getAppConfig } from './config'

/**
 * 搜索房间列表
 * @param keyword 搜索关键词（可选）
 * @returns Promise<RoomSearchResponse>
 */
export async function searchRooms(keyword?: string): Promise<RoomInfo[]> {
  const config = getAppConfig()
  const url = new URL('/house/search', config.api.baseUrl)

  if (keyword) {
    url.searchParams.append('keyword', keyword)
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return data.data as RoomInfo[]
  } catch (error) {
    console.error('搜索房间失败:', error)
    throw error
  }
}
