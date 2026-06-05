import { IconArrowLeft } from './icons'
import './BackButton.css'

interface BackButtonProps {
  onClick: () => void
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button className="back-btn" onClick={onClick}>
      <IconArrowLeft size={16} />
      Retour
    </button>
  )
}
