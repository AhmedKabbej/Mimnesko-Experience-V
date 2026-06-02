import { useState, useEffect } from 'react'
import InfiniteMenu from './InfiniteMenu'
import './Gallery3D.css'

interface MenuItem {
  image: string
  link: string
  title: string
  description: string
}

interface Gallery3DProps {
  onBack?: () => void
}

export default function Gallery3D({ onBack }: Gallery3DProps) {
  const [items, setItems] = useState<MenuItem[]>([])

  // Load memories from public folder
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
            title: `Theme de la generation ${i}`,
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
    <div className="gallery-3d-wrapper">
      <InfiniteMenu items={items} scale={1.2} />

      <button className="gallery-back-btn" onClick={onBack}>
        ← Retour
      </button>
    </div>
  )
}
