import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './modules/auth/AuthContext'
import { MicDeviceProvider } from './modules/recordings/MicDeviceContext'
import { router } from './routes/router'
import { ThemeProvider } from './theme/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MicDeviceProvider>
          <RouterProvider router={router} />
        </MicDeviceProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
