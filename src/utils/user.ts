import type { User } from "@/types";

/**
 * 解析用户名，支持 "name<email>" 格式
 * @param nameString 原始用户名字符串
 * @returns 解析后的用户名和邮箱
 */
export function parseUserName(nameString: string): {
  displayName: string;
  email?: string;
} {
  // 匹配 "name<email>" 格式
  const emailPattern = /^(.+?)<([^<>]+@[^<>]+\.[^<>]+)>$/;
  const match = nameString.match(emailPattern);

  if (match) {
    return {
      displayName: match[1].trim(),
      email: match[2].trim(),
    };
  }

  // 如果不匹配模式，返回原始名称
  return {
    displayName: nameString.trim(),
  };
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
  defaultImage: string = "mp"
): string {
  // 将邮箱转换为小写并去除空格
  const normalizedEmail = email.toLowerCase().trim();

  // 计算 MD5 哈希
  const hash = md5(normalizedEmail);

  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}

/**
 * 简单的 MD5 哈希函数
 * @param str 要哈希的字符串
 * @returns MD5 哈希值
 */
function md5(str: string): string {
  // 这是一个简化的 MD5 实现，用于生成 Gravatar URL
  // 在生产环境中，建议使用更完善的 crypto 库

  function rotateLeft(value: number, amount: number): number {
    return (value << amount) | (value >>> (32 - amount));
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function md5cmn(
    q: number,
    a: number,
    b: number,
    x: number,
    s: number,
    t: number
  ): number {
    return addUnsigned(
      rotateLeft(addUnsigned(addUnsigned(a, q), addUnsigned(x, t)), s),
      b
    );
  }

  function md5ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t);
  }

  function md5gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
  }

  function md5hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function md5ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  function convertToWordArray(str: string): number[] {
    const wordArray: number[] = [];
    for (let i = 0; i < str.length * 8; i += 8) {
      wordArray[i >> 5] |= (str.charCodeAt(i / 8) & 0xff) << i % 32;
    }
    return wordArray;
  }

  function convertToHexString(wordArray: number[]): string {
    let hex = "";
    for (let i = 0; i < wordArray.length * 4; i++) {
      hex +=
        ((wordArray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf).toString(16) +
        ((wordArray[i >> 2] >> ((i % 4) * 8)) & 0xf).toString(16);
    }
    return hex;
  }

  const wordArray = convertToWordArray(str);
  const byteCount = str.length * 8;

  wordArray[byteCount >> 5] |= 0x80 << byteCount % 32;
  wordArray[(((byteCount + 64) >>> 9) << 4) + 14] = byteCount;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < wordArray.length; i += 16) {
    const oldA = a;
    const oldB = b;
    const oldC = c;
    const oldD = d;

    a = md5ff(a, b, c, d, wordArray[i], 7, -680876936);
    d = md5ff(d, a, b, c, wordArray[i + 1], 12, -389564586);
    c = md5ff(c, d, a, b, wordArray[i + 2], 17, 606105819);
    b = md5ff(b, c, d, a, wordArray[i + 3], 22, -1044525330);
    a = md5ff(a, b, c, d, wordArray[i + 4], 7, -176418897);
    d = md5ff(d, a, b, c, wordArray[i + 5], 12, 1200080426);
    c = md5ff(c, d, a, b, wordArray[i + 6], 17, -1473231341);
    b = md5ff(b, c, d, a, wordArray[i + 7], 22, -45705983);
    a = md5ff(a, b, c, d, wordArray[i + 8], 7, 1770035416);
    d = md5ff(d, a, b, c, wordArray[i + 9], 12, -1958414417);
    c = md5ff(c, d, a, b, wordArray[i + 10], 17, -42063);
    b = md5ff(b, c, d, a, wordArray[i + 11], 22, -1990404162);
    a = md5ff(a, b, c, d, wordArray[i + 12], 7, 1804603682);
    d = md5ff(d, a, b, c, wordArray[i + 13], 12, -40341101);
    c = md5ff(c, d, a, b, wordArray[i + 14], 17, -1502002290);
    b = md5ff(b, c, d, a, wordArray[i + 15], 22, 1236535329);

    a = md5gg(a, b, c, d, wordArray[i + 1], 5, -165796510);
    d = md5gg(d, a, b, c, wordArray[i + 6], 9, -1069501632);
    c = md5gg(c, d, a, b, wordArray[i + 11], 14, 643717713);
    b = md5gg(b, c, d, a, wordArray[i], 20, -373897302);
    a = md5gg(a, b, c, d, wordArray[i + 5], 5, -701558691);
    d = md5gg(d, a, b, c, wordArray[i + 10], 9, 38016083);
    c = md5gg(c, d, a, b, wordArray[i + 15], 14, -660478335);
    b = md5gg(b, c, d, a, wordArray[i + 4], 20, -405537848);
    a = md5gg(a, b, c, d, wordArray[i + 9], 5, 568446438);
    d = md5gg(d, a, b, c, wordArray[i + 14], 9, -1019803690);
    c = md5gg(c, d, a, b, wordArray[i + 3], 14, -187363961);
    b = md5gg(b, c, d, a, wordArray[i + 8], 20, 1163531501);
    a = md5gg(a, b, c, d, wordArray[i + 13], 5, -1444681467);
    d = md5gg(d, a, b, c, wordArray[i + 2], 9, -51403784);
    c = md5gg(c, d, a, b, wordArray[i + 7], 14, 1735328473);
    b = md5gg(b, c, d, a, wordArray[i + 12], 20, -1926607734);

    a = md5hh(a, b, c, d, wordArray[i + 5], 4, -378558);
    d = md5hh(d, a, b, c, wordArray[i + 8], 11, -2022574463);
    c = md5hh(c, d, a, b, wordArray[i + 11], 16, 1839030562);
    b = md5hh(b, c, d, a, wordArray[i + 14], 23, -35309556);
    a = md5hh(a, b, c, d, wordArray[i + 1], 4, -1530992060);
    d = md5hh(d, a, b, c, wordArray[i + 4], 11, 1272893353);
    c = md5hh(c, d, a, b, wordArray[i + 7], 16, -155497632);
    b = md5hh(b, c, d, a, wordArray[i + 10], 23, -1094730640);
    a = md5hh(a, b, c, d, wordArray[i + 13], 4, 681279174);
    d = md5hh(d, a, b, c, wordArray[i], 11, -358537222);
    c = md5hh(c, d, a, b, wordArray[i + 3], 16, -722521979);
    b = md5hh(b, c, d, a, wordArray[i + 6], 23, 76029189);
    a = md5hh(a, b, c, d, wordArray[i + 9], 4, -640364487);
    d = md5hh(d, a, b, c, wordArray[i + 12], 11, -421815835);
    c = md5hh(c, d, a, b, wordArray[i + 15], 16, 530742520);
    b = md5hh(b, c, d, a, wordArray[i + 2], 23, -995338651);

    a = md5ii(a, b, c, d, wordArray[i], 6, -198630844);
    d = md5ii(d, a, b, c, wordArray[i + 7], 10, 1126891415);
    c = md5ii(c, d, a, b, wordArray[i + 14], 15, -1416354905);
    b = md5ii(b, c, d, a, wordArray[i + 5], 21, -57434055);
    a = md5ii(a, b, c, d, wordArray[i + 12], 6, 1700485571);
    d = md5ii(d, a, b, c, wordArray[i + 3], 10, -1894986606);
    c = md5ii(c, d, a, b, wordArray[i + 10], 15, -1051523);
    b = md5ii(b, c, d, a, wordArray[i + 1], 21, -2054922799);
    a = md5ii(a, b, c, d, wordArray[i + 8], 6, 1873313359);
    d = md5ii(d, a, b, c, wordArray[i + 15], 10, -30611744);
    c = md5ii(c, d, a, b, wordArray[i + 6], 15, -1560198380);
    b = md5ii(b, c, d, a, wordArray[i + 13], 21, 1309151649);
    a = md5ii(a, b, c, d, wordArray[i + 4], 6, -145523070);
    d = md5ii(d, a, b, c, wordArray[i + 11], 10, -1120210379);
    c = md5ii(c, d, a, b, wordArray[i + 2], 15, 718787259);
    b = md5ii(b, c, d, a, wordArray[i + 9], 21, -343485551);

    a = addUnsigned(a, oldA);
    b = addUnsigned(b, oldB);
    c = addUnsigned(c, oldC);
    d = addUnsigned(d, oldD);
  }

  return convertToHexString([a, b, c, d]);
}

/**
 * 处理用户对象，解析用户名并设置 Gravatar 头像
 * @param user 用户对象
 * @returns 处理后的用户对象
 */
export function processUser(user: User): User {
  const { displayName, email } = parseUserName(user.name);

  return {
    ...user,
    name: displayName,
    avatar: email ? generateGravatarUrl(email) : user.avatar,
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
