import { useEffect } from 'react'
import './EndCalm.css'

interface EndCalmProps {
  /** Appelé au tap ou après le délai de recueillement. */
  onContinue: () => void
  /** Délai avant de continuer automatiquement (ms). */
  autoDelay?: number
}

/**
 * Écran calme de fin / recueillement.
 * « Prenez le temps d'y repenser. / Fermez les yeux. / Remerciez la vie. »
 */
export default function EndCalm({ onContinue, autoDelay = 9000 }: EndCalmProps) {
  useEffect(() => {
    const id = setTimeout(onContinue, autoDelay)
    return () => clearTimeout(id)
  }, [onContinue, autoDelay])

  return (
    <div className="end-calm" onClick={onContinue}>
      <div className="end-calm-inner">
        <p className="end-calm-line">Prenez le temps d’y repenser.</p>
        <p className="end-calm-line">Fermez les yeux.</p>
        <p className="end-calm-line">Remerciez la vie.</p>
      </div>
      <span className="end-calm-hint">Touchez pour continuer</span>
    </div>
  )
}
