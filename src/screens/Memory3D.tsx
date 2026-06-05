import InfiniteMenu from '../components/InfiniteMenu'
import BackButton from '../components/BackButton'
import { useMemories } from '../hooks/useMemories'
import './Memory3D.css'

interface Memory3DProps {
  onBack: () => void
  onOpenModel: () => void
}

export default function Memory3D({ onBack, onOpenModel }: Memory3DProps) {
  const items = useMemories()

  return (
    <div className="memory-3d-wrapper">
      <InfiniteMenu items={items} scale={1.0} onActionClick={onOpenModel} />
      <BackButton onClick={onBack} />
      <p className="memory-nav-hint">Faites cliquer et glisser depuis le centre des images pour naviguer</p>
    </div>
  )
}
