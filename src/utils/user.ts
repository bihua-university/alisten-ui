import type { User } from '@/types'
import { MD5 } from 'crypto-js'

/**
 * 解析用户名，支持 "name<email>" 格式
 * @param nameString 原始用户名字符串
 * @returns 解析后的用户名和邮箱
 */
export function parseUserName(nameString: string): {
  displayName: string
  email?: string
} {
  // 匹配 "name<email>" 格式
  const emailPattern = /(.+?)<([^<>][^<>@]*@[^<>][^.<>]*\.[^<>]+)>/
  const match = nameString.match(emailPattern)

  if (match) {
    return {
      displayName: match[1].trim(),
      email: match[2].trim(),
    }
  }

  // 如果不匹配模式，返回原始名称
  return {
    displayName: nameString.trim(),
  }
}

/**
 * 生成 Gravatar 头像 URL
 * @param email 邮箱地址
 * @param size 头像尺寸，默认 200
 * @param defaultImage 默认头像类型，默认 'mp'
 * @returns Gravatar URL
 */
export function generateGravatarUrl(
  email: string,
  size: number = 200,
  defaultImage: string = 'mp',
): string {
  // 将邮箱转换为小写并去除空格
  const normalizedEmail = email.toLowerCase().trim()
  // 计算 MD5 哈希
  const hash = MD5(normalizedEmail).toString()

  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`
}

/**
 * 处理用户对象，解析用户名并设置 Gravatar 头像
 * @param user 用户对象
 * @returns 处理后的用户对象
 */
export function processUser(user: User): User {
  const { displayName, email } = parseUserName(user.name)

  return {
    ...user,
    name: displayName,
    avatar: email ? generateGravatarUrl(email) : user.avatar,
  }
}

/**
 * 批量处理用户列表
 * @param users 用户列表
 * @returns 处理后的用户列表
 */
export function processUsers(users: User[]): User[] {
  return users.map(processUser)
}

/**
 * 保存用户昵称到本地存储
 * @param nickname 用户昵称
 */
export function saveNickname(nickname: string): void {
  localStorage.setItem('alisten_nickname', nickname)
}

/**
 * 从本地存储获取用户昵称
 * @returns 保存的昵称，如果没有则返回 null
 */
export function getSavedNickname(): string | null {
  return localStorage.getItem('alisten_nickname')
}

/**
 * 清除保存的昵称
 */
export function clearNickname(): void {
  localStorage.removeItem('alisten_nickname')
}
