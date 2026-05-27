import { Store } from './store-base'

type Theme = 'dark' | 'blockframe'

interface ThemeState {
  theme: Theme
}

class ThemeStore extends Store<ThemeState> {
  constructor() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('alisten-theme') as Theme : null
    super({ theme: saved === 'blockframe' ? 'blockframe' : 'dark' })
    this.applyTheme()
  }

  setTheme(theme: Theme) {
    this.setState({ theme })
    localStorage.setItem('alisten-theme', theme)
    this.applyTheme()
  }

  private applyTheme() {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', this.state.theme)
    }
  }
}

export const themeStore = new ThemeStore()
