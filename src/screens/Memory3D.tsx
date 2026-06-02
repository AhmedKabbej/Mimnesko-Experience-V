import { useState, useEffect, lazy, Suspense } from 'react'
import InfiniteMenu from '../components/InfiniteMenu'
import './Memory3D.css'

const ModelViewer = lazy(() => import('../components/ModelViewer'))

const MODEL_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb'

interface MenuItem {
  image: string
  link: string
  title: string
  description: string
}

interface Memory3DProps {
  onBack?: () => void
}

export default function Memory3D({ onBack }: Memory3DProps) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [showModel, setShowModel] = useState(false)

  useEffect(() => {
    const loadMemories = async () => {
      const loadedItems: MenuItem[] = []
      for (let i = 1; i <= 100; i++) {
        const imagePath = `/memories/memory-${i}.jpg`
        try {
          const img = new Image()
          img.src = imagePath
          await new Promise((resolve, reject) => {
            img.onload = () => resolve(null)
            img.onerror = () => reject(null)
            setTimeout(() => reject(null), 100)
          })
          loadedItems.push({
            image: imagePath,
            link: '',
            title: `Memory ${i}`,
            description: `Souvenir #${i}`,
          })
        } catch (e) {
          break
        }
      }
      setItems(loadedItems)
    }
    loadMemories()
  }, [])

  return (
    <div className="memory-3d-wrapper">
      <InfiniteMenu items={items} scale={1.0} onActionClick={() => setShowModel(true)} />

      <button className="memory-back-btn" onClick={onBack}>
        ← Retour
      </button>

      {showModel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => setShowModel(false)}
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              padding: '8px 18px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 14,
              zIndex: 10,
            }}
          >
            ← Retour
          </button>

          <Suspense fallback={null}>
            <ModelViewer
              url={MODEL_URL}
              width="100vw"
              height="100vh"
              autoRotate
              autoRotateSpeed={0.4}
              fadeIn
              showScreenshotButton={false}
              defaultZoom={1.5}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}
