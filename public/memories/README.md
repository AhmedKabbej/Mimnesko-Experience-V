# Galerie de Souvenirs

Placez vos images JPG dans ce dossier pour les afficher dans la galerie immersive.

## Structure

Ajoutez vos images avec les noms:
- `memory-1.jpg`
- `memory-2.jpg`
- `memory-3.jpg`
- `memory-4.jpg`
- etc...

## Mise à jour

Modifiez le tableau `memories` dans [Memory3D.tsx](../../src/Memory3D.tsx) pour ajouter ou renommer vos souvenirs.

### Exemple:
```typescript
const [memories, setMemories] = useState<Memory[]>([
  { id: 1, image: '/memories/memory-1.jpg', title: 'Vacances à Paris' },
  { id: 2, image: '/memories/memory-2.jpg', title: 'Pique-nique' },
  { id: 3, image: '/memories/memory-3.jpg', title: 'Coucher de soleil' },
])
```

## Navigation

- **Flèches** (← →) : Naviguer
- **Défilement** (↑ ↓) : Naviguer
- **Drag** : Faire glisser pour naviguer
- **Clic** : Sélectionner une image
- **Espace** : Prochain souvenir
