import gsap from 'gsap'
import { useTextSplitAnimation } from '../hooks/useTextSplitAnimation'

interface HomeCardProps {
  visible: boolean
  onCreateWalk: () => void
  onSettings: () => void
}

export default function HomeCard({ visible, onCreateWalk }: HomeCardProps) {
  const { subtitleRef, titleRef, buttonRef } = useTextSplitAnimation(visible)

  const handleClick = () => {
    gsap.timeline()
      .to(buttonRef.current, { scale: 0.95, duration: 0.1 })
      .to(buttonRef.current, { scale: 1, duration: 0.1 }, 0.1)
    onCreateWalk()
  }

  return (
    <div
      className="app-container"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div className="content-wrapper">
        <div className="card-container">
          <div className="text-section">
            <p className="subtitle" ref={subtitleRef}>
              C'est ici que tout commence.
            </p>
            <p className="title" ref={titleRef}>
              Marche, ressens, capture… et laisse tes souvenirs prendre vie.
            </p>
          </div>
          <button
            className="primary-button"
            ref={buttonRef}
            onClick={handleClick}
            style={visible ? undefined : { opacity: 0, pointerEvents: 'none' }}
          >
            Créer une balade Mimnesko
          </button>
        </div>
      </div>
    </div>
  )
}
