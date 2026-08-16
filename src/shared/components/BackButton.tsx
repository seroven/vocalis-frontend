import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'

export function BackButton() {
  const navigate = useNavigate()

  function handleBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  return (
    <Button variant="icon" aria-label="Volver" onClick={handleBack}>
      <ArrowLeft size={18} />
    </Button>
  )
}
