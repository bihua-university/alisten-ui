import type { IconNode } from 'lucide'
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  Heart,
  HelpCircle,
  History,
  Home,
  Info,
  ListMusic,
  Lock,
  LogIn,
  Maximize2,
  MessageSquare,
  Minimize2,
  Minus,
  Music,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Share2,
  Shuffle,
  SkipForward,
  Sparkles,
  Trash,
  Trash2,
  Unlock,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide'

function renderNode(node: IconNode): string {
  const n = node as unknown as [string, Record<string, string>, IconNode[] | undefined]
  const tag = n[0]
  const attrs = n[1] || {}
  const children = n[2]
  const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
  if (children && children.length > 0) {
    const childSvg = children.map(renderNode).join('')
    return `<${tag} ${attrStr}>${childSvg}</${tag}>`
  }
  return `<${tag} ${attrStr} />`
}

function iconToSvg(icon: any, size = 20, className = ''): string {
  const iconArray = Array.isArray(icon) ? icon : [icon]
  const children = iconArray.map(renderNode).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${className ? `class="${className}"` : ''}>${children}</svg>`
}

export const icons = {
  listMusic: (s = 20, c = '') => iconToSvg(ListMusic, s, c),
  messageSquare: (s = 20, c = '') => iconToSvg(MessageSquare, s, c),
  play: (s = 20, c = '') => iconToSvg(Play, s, c),
  pause: (s = 20, c = '') => iconToSvg(Pause, s, c),
  skipForward: (s = 20, c = '') => iconToSvg(SkipForward, s, c),
  volume2: (s = 20, c = '') => iconToSvg(Volume2, s, c),
  volumeX: (s = 20, c = '') => iconToSvg(VolumeX, s, c),
  search: (s = 20, c = '') => iconToSvg(Search, s, c),
  settings: (s = 20, c = '') => iconToSvg(Settings, s, c),
  helpCircle: (s = 20, c = '') => iconToSvg(HelpCircle, s, c),
  history: (s = 20, c = '') => iconToSvg(History, s, c),
  share2: (s = 20, c = '') => iconToSvg(Share2, s, c),
  heart: (s = 20, c = '') => iconToSvg(Heart, s, c),
  trash2: (s = 20, c = '') => iconToSvg(Trash2, s, c),
  x: (s = 20, c = '') => iconToSvg(X, s, c),
  chevronLeft: (s = 20, c = '') => iconToSvg(ChevronLeft, s, c),
  chevronRight: (s = 20, c = '') => iconToSvg(ChevronRight, s, c),
  music: (s = 20, c = '') => iconToSvg(Music, s, c),
  users: (s = 20, c = '') => iconToSvg(Users, s, c),
  send: (s = 20, c = '') => iconToSvg(Send, s, c),
  plus: (s = 20, c = '') => iconToSvg(Plus, s, c),
  minus: (s = 20, c = '') => iconToSvg(Minus, s, c),
  maximize2: (s = 20, c = '') => iconToSvg(Maximize2, s, c),
  minimize2: (s = 20, c = '') => iconToSvg(Minimize2, s, c),
  wifi: (s = 20, c = '') => iconToSvg(Wifi, s, c),
  wifiOff: (s = 20, c = '') => iconToSvg(WifiOff, s, c),
  refreshCw: (s = 20, c = '') => iconToSvg(RefreshCw, s, c),
  checkCircle: (s = 20, c = '') => iconToSvg(CheckCircle, s, c),
  alertCircle: (s = 20, c = '') => iconToSvg(AlertCircle, s, c),
  alertTriangle: (s = 20, c = '') => iconToSvg(AlertTriangle, s, c),
  info: (s = 20, c = '') => iconToSvg(Info, s, c),
  copy: (s = 20, c = '') => iconToSvg(Copy, s, c),
  download: (s = 20, c = '') => iconToSvg(Download, s, c),
  trash: (s = 20, c = '') => iconToSvg(Trash, s, c),
  clock: (s = 20, c = '') => iconToSvg(Clock, s, c),
  calendar: (s = 20, c = '') => iconToSvg(Calendar, s, c),
  barChart3: (s = 20, c = '') => iconToSvg(BarChart3, s, c),
  zap: (s = 20, c = '') => iconToSvg(Zap, s, c),
  eye: (s = 20, c = '') => iconToSvg(Eye, s, c),
  eyeOff: (s = 20, c = '') => iconToSvg(EyeOff, s, c),
  lock: (s = 20, c = '') => iconToSvg(Lock, s, c),
  unlock: (s = 20, c = '') => iconToSvg(Unlock, s, c),
  home: (s = 20, c = '') => iconToSvg(Home, s, c),
  logIn: (s = 20, c = '') => iconToSvg(LogIn, s, c),
  userPlus: (s = 20, c = '') => iconToSvg(UserPlus, s, c),
  sparkles: (s = 20, c = '') => iconToSvg(Sparkles, s, c),
  shuffle: (s = 20, c = '') => iconToSvg(Shuffle, s, c),
}
