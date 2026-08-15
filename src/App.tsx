import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './modules/auth/AuthContext'
import { router } from './routes/router'
import { ThemeProvider } from './theme/ThemeContext'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}
