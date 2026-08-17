import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'vocalis-mic-device'

type MicDeviceContextValue = {
  deviceId: string | null
  devices: MediaDeviceInfo[]
  setDeviceId: (id: string | null) => void
  refresh: () => Promise<void>
}

const MicDeviceContext = createContext<MicDeviceContextValue | null>(null)

function readStoredDevice() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function MicDeviceProvider({ children }: { children: ReactNode }) {
  const [deviceId, setDeviceIdState] = useState<string | null>(() => readStoredDevice())
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])

  const refresh = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setDevices([])
      return
    }

    const list = await navigator.mediaDevices.enumerateDevices()
    const mics = list.filter((device) => device.kind === 'audioinput')
    setDevices(mics)

    setDeviceIdState((current) =>
      current && !mics.some((device) => device.deviceId === current) ? null : current,
    )
  }, [])

  useEffect(() => {
    void refresh()
    const media = navigator.mediaDevices
    if (!media?.addEventListener) {
      return
    }

    const handleChange = () => {
      void refresh()
    }
    media.addEventListener('devicechange', handleChange)
    return () => media.removeEventListener('devicechange', handleChange)
  }, [refresh])

  const setDeviceId = useCallback((id: string | null) => {
    setDeviceIdState(id)
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY, id)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // ignore quota / private mode
    }
  }, [])

  const value = useMemo(
    () => ({ deviceId, devices, setDeviceId, refresh }),
    [deviceId, devices, setDeviceId, refresh],
  )

  return <MicDeviceContext.Provider value={value}>{children}</MicDeviceContext.Provider>
}

export function useMicDevice() {
  const context = useContext(MicDeviceContext)

  if (!context) {
    throw new Error('useMicDevice debe usarse dentro de MicDeviceProvider')
  }

  return context
}
