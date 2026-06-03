import { useEffect, useState } from 'react'

interface MemoryItem {
  image: string
  link: string
  title: string
  description: string
}

export function useMemories() {
  const [items, setItems] = useState<MemoryItem[]>([])

  useEffect(() => {
    const load = async () => {
      const loaded: MemoryItem[] = []
      for (let i = 1; i <= 100; i++) {
        const path = `/memories/memory-${i}.jpg`
        try {
          const img = new Image()
          img.src = path
          await new Promise((resolve, reject) => {
            img.onload = () => resolve(null)
            img.onerror = () => reject(null)
            setTimeout(() => reject(null), 100)
          })
          const themes = [
            'Enfance',
            'Été Sans Fin',
            'Famille',
            'Premières Fois',
            "Amitié D'Avant",
            'Insouciance',
            'Lumière Dorée',
            'Odeur De Pain Chaud',
            'Souvenirs De Campagne',
            'Vacances En Mer',
            'Douceur Perdue',
            'Retour Aux Sources',
            "Jeux D'Autrefois",
            'Instant Suspendu',
            'Bonheur Simple',
            'Coucher De Soleil',
            'Tendresse',
            'Temps Qui Passe',
            'Lenteur Heureuse',
            "Souvenirs D'Été",
          ]
          const theme = themes[(i - 1) % themes.length]
          loaded.push({ image: path, link: '', title: `Mémoire ${i}`, description: theme })
        } catch {
          break
        }
      }
      setItems(loaded)
    }
    load()
  }, [])

  return items
}
