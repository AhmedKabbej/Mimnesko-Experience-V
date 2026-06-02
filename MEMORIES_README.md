# 📸 Galerie Immersive de Souvenirs

## Comment ajouter vos souvenirs

### 1️⃣ Ajouter vos images JPG
Placez vos fichiers `.jpg` dans le dossier `public/memories/`:
```
public/
└── memories/
    ├── memory-1.jpg
    ├── memory-2.jpg
    ├── memory-3.jpg
    └── memory-4.jpg
```

### 2️⃣ Mettre à jour la liste des souvenirs
Modifiez le fichier `src/Memory3D.tsx` et mettez à jour le tableau `memories`:

```typescript
const memories: Memory[] = [
  { id: 1, image: '/memories/memory-1.jpg', title: 'Première visite' },
  { id: 2, image: '/memories/memory-2.jpg', title: 'Journée spéciale' },
  { id: 3, image: '/memories/memory-3.jpg', title: 'Bons moments' },
  { id: 4, image: '/memories/memory-4.jpg', title: 'Souvenirs précieux' },
]
```

## 🎥 Navigation Immersive (Appareil Photo Argentique)

### Contrôles disponibles:
- **Flèches gauche/droite** ⬅️➡️ - Naviguer entre les souvenirs
- **Barre d'espace** or **Flèche droite** - Suivant
- **Molette de souris** 🖱️ - Défilement naturel
- **Drag & Drop** 🖥️ - Swipe sur mobile

### Expérience:
✨ Grain cinématique pour une sensation vintage
📸 Effet "snap" réaliste lors de la navigation
🎬 Animations fluides et transitions élégantes
🌙 Ambiance immersive avec dégradé bleu-nuit

## 💡 Conseil
Utilisez des images en haute résolution (1920x1080 minimum) pour une meilleure expérience visuelle.
