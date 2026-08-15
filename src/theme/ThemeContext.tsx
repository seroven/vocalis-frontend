import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  animateHueTo,
  applyTheme,
  persistTheme,
  readStoredTheme,
  type StoredTheme,
  type ThemeMode,
} from './theme'

type ThemeContextValue = StoredTheme & {
  setMode: (mode: ThemeMode) => void
  setHue: (hue: number) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<StoredTheme>(() => readStoredTheme())
  const firstHue = useRef(true)

  useEffect(() => {
    applyTheme(theme, { snapHue: false })
    persistTheme(theme)
  }, [theme])

  useEffect(() => {
    if (firstHue.current) {
      firstHue.current = false
      applyTheme(theme)
      return
    }

    animateHueTo(theme.hue)
  }, [theme.hue])

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...theme,
      setMode: (mode) => setTheme((current) => ({ ...current, mode })),
      setHue: (hue) => setTheme((current) => ({ ...current, hue })),
      toggleMode: () =>
        setTheme((current) => ({
          ...current,
          mode: current.mode === 'dark' ? 'light' : 'dark',
        })),
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }

  return context
}
