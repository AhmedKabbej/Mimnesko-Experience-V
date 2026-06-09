import { useTextSplitAnimation } from '../hooks/useTextSplitAnimation'
import GooeySearchBar from './GooeySearchBar'

interface HomeCardProps {
  visible: boolean
  onCreateWalk: () => void
  onSettings: () => void
  onStartJourney: () => void
}

export default function HomeCard({ visible, onStartJourney }: HomeCardProps) {
  const { subtitleRef, titleRef } = useTextSplitAnimation(visible)

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
          </div>

          <GooeySearchBar onStart={onStartJourney} />

          <div className="text-section">
            <p className="title" ref={titleRef}>
              Marche, ressens, capture… et laisse tes souvenirs prendre vie.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
