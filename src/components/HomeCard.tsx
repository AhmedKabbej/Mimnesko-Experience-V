import { useEffect, useState } from 'react'
import { useTextSplitAnimation } from '../hooks/useTextSplitAnimation'
import GooeySearchBar from './GooeySearchBar'
import PlasmaWave from './PlasmaWave'

interface HomeCardProps {
  visible: boolean
  onCreateWalk: () => void
  onSettings: () => void
  onStartJourney: () => void
}

export default function HomeCard({ visible, onStartJourney }: HomeCardProps) {
  const { subtitleRef, titleRef } = useTextSplitAnimation(visible)
  const [searchActive, setSearchActive] = useState(false)
  const [plasmaMounted, setPlasmaMounted] = useState(false)

  // On garde le plasma monté pendant le fondu de sortie, puis on le démonte.
  useEffect(() => {
    if (searchActive) {
      setPlasmaMounted(true)
      return
    }
    const id = setTimeout(() => setPlasmaMounted(false), 900)
    return () => clearTimeout(id)
  }, [searchActive])

  return (
    <div
      className={`app-container${searchActive ? ' is-searching' : ''}`}
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div className={`home-plasma${searchActive ? ' is-on' : ''}`} aria-hidden="true">
        {plasmaMounted && (
          <PlasmaWave
            colors={['#FF6A00', '#ffffff']}
            speed1={0.075}
            speed2={0.05}
            focalLength={0.8}
            bend1={1}
            bend2={0.5}
            dir2={1.0}
            rotationDeg={0}
          />
        )}
      </div>

      <div className="content-wrapper">
        <div className="card-container">
          <div className="text-section">
            <p className="subtitle" ref={subtitleRef}>
              C'est ici que tout commence.
            </p>
          </div>

          <GooeySearchBar onStart={onStartJourney} onOpenChange={setSearchActive} />

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
