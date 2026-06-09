import { useEffect, useState } from 'react'

interface MemoryItem {
  image: string
  link: string
  title: string
  description: string
}

const THEMES = [
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

const MAX_MEMORIES = 60 // borne haute de sondage

function probe(src: string) {
  return new Promise<boolean>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

export function useMemories() {
  const [items, setItems] = useState<MemoryItem[]>([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      // On sonde toutes les images en parallèle (rapide, pas de timeout arbitraire).
      const exists = await Promise.all(
        Array.from({ length: MAX_MEMORIES }, (_, k) =>
          probe(`/memories/memory-${k + 1}.jpg`)
        )
      )
      if (cancelled) return

      // On garde la suite contiguë depuis memory-1.
      const loaded: MemoryItem[] = []
      for (let i = 0; i < MAX_MEMORIES; i++) {
        if (!exists[i]) break
        const n = i + 1
        loaded.push({
          image: `/memories/memory-${n}.jpg`,
          link: '',
          title: `Mémoire ${n}`,
          description: THEMES[i % THEMES.length],
        })
      }
      setItems(loaded)
    }

    load()
    return () => { cancelled = true }
  }, [])

  return items
}
