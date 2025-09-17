import type { User } from "@/types";

/**
 * 生成 Gravatar 头像 URL
 * @param emailHash 邮箱的 MD5 哈希值
 * @param size 头像尺寸，默认 200
 * @param defaultImage 默认头像类型，默认 'mp'
 * @returns Gravatar URL
 */
export function generateGravatarUrl(
  emailHash: string,
  size: number = 200,
  defaultImage: string = "mp"
): string {
  return `https://www.gravatar.com/avatar/${emailHash}?s=${size}&d=${defaultImage}`;
}

/**
 * 处理用户对象，解析用户名并设置 Gravatar 头像
 * @param user 用户对象
 * @returns 处理后的用户对象
 */
export function processUser(user: User): User {
  return {
    ...user,
    avatar: user.email ? generateGravatarUrl(user.email) : user.avatar,
  };
}

/**
 * 批量处理用户列表
 * @param users 用户列表
 * @returns 处理后的用户列表
 */
export function processUsers(users: User[]): User[] {
  return users.map(processUser);
}

/**
 * 保存房间密码到本地存储
 * @param roomId 房间ID
 * @param password 房间密码
 */
export function saveRoomPassword(roomId: string, password: string): void {
  localStorage.setItem(`alisten_room_password_${roomId}`, password);
}

/**
 * 从本地存储获取房间密码
 * @param roomId 房间ID
 * @returns 保存的密码，如果没有则返回 null
 */
export function getSavedRoomPassword(roomId: string): string | null {
  return localStorage.getItem(`alisten_room_password_${roomId}`);
}

/**
 * 清除保存的房间密码
 * @param roomId 房间ID
 */
export function clearRoomPassword(roomId: string): void {
  localStorage.removeItem(`alisten_room_password_${roomId}`);
}

/**
 * 保存上次进入的房间ID
 * @param roomId 房间ID
 */
export function saveLastJoinedRoom(roomId: string): void {
  localStorage.setItem("alisten_last_joined_room", roomId);
}

/**
 * 从本地存储获取上次进入的房间ID
 * @returns 保存的房间ID，如果没有则返回 null
 */
export function getLastJoinedRoom(): string | null {
  return localStorage.getItem("alisten_last_joined_room");
}

/**
 * 清除保存的上次进入房间记录
 */
export function clearLastJoinedRoom(): void {
  localStorage.removeItem("alisten_last_joined_room");
}

// 获取默认头像
export function getDefaultAvatar(seed?: string | number): string {
  const randomSeed = seed || Date.now();
  return `https://picsum.photos/200/200?random=${randomSeed}`;
}
