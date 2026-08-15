export type ThemeMode = 'light' | 'dark'

export type ColorPreset = {
  id: string
  label: string
  hue: number
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: 'coral', label: 'Coral', hue: 16 },
  { id: 'amber', label: 'Ámbar', hue: 38 },
  { id: 'sage', label: 'Sage', hue: 148 },
  { id: 'teal', label: 'Teal', hue: 186 },
  { id: 'violet', label: 'Violeta', hue: 268 },
  { id: 'rose', label: 'Rosa', hue: 332 },
]

export const DEFAULT_HUE = COLOR_PRESETS[4].hue
export const THEME_STORAGE_KEY = 'vocalis-theme'

export type StoredTheme = {
  mode: ThemeMode
  hue: number
}

export function readStoredTheme(): StoredTheme {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (!raw) {
      return defaultTheme()
    }

    const parsed = JSON.parse(raw) as Partial<StoredTheme>
    const hue = typeof parsed.hue === 'number' ? parsed.hue : DEFAULT_HUE
    const mode = parsed.mode === 'light' || parsed.mode === 'dark' ? parsed.mode : defaultMode()

    return { mode, hue }
  } catch {
    return defaultTheme()
  }
}

export function applyTheme(theme: StoredTheme, options?: { snapHue?: boolean }) {
  const root = document.documentElement
  root.dataset.theme = theme.mode

  if (options?.snapHue !== false) {
    root.style.setProperty('--hue', String(theme.hue))
  }
}

let hueFrame = 0

export function animateHueTo(target: number, duration = 280) {
  const root = document.documentElement
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced) {
    root.style.setProperty('--hue', String(target))
    return
  }

  const current = Number(root.style.getPropertyValue('--hue'))
  const from = Number.isFinite(current) ? current : target
  let delta = target - from

  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360

  cancelAnimationFrame(hueFrame)
  const start = performance.now()

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration)
    const eased = 1 - (1 - progress) ** 3
    const value = (from + delta * eased + 360) % 360
    root.style.setProperty('--hue', value.toFixed(2))

    if (progress < 1) {
      hueFrame = requestAnimationFrame(tick)
    }
  }

  hueFrame = requestAnimationFrame(tick)
}

export function persistTheme(theme: StoredTheme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
}

function defaultMode(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function defaultTheme(): StoredTheme {
  return {
    mode: defaultMode(),
    hue: DEFAULT_HUE,
  }
}
