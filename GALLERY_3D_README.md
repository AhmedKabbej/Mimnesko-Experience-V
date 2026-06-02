# 🎭 Galerie 3D Immersive - Mimnesko Experience

## 📋 Vue d'ensemble

Bienvenue dans la **Galerie 3D Immersive** - Une expérience de visualisation d'art moderne en trois dimensions. Navigatez dans une salle d'exposition virtuelle avec vos souvenirs affichés sur les murs comme des œuvres d'art.

## 🎮 Contrôles

### Navigation de la caméra
- **Drag de souris** 🖱️ - Tourner autour de la galerie
- **Scroll/Zoom** 🔍 - Zoomer/Dézommer
- **Double-click** - Réinitialiser la vue

### Interaction avec les images
- **Survol** ✨ - Les images s'agrandissent légèrement et s'illuminent
- **Click** - Sélectionner une image (non interactif pour le moment)

## 📸 Ajouter vos souvenirs

### Étape 1: Placer vos images
Ajoutez vos fichiers JPG dans le dossier `public/memories/`:
```
public/
└── memories/
    ├── memory-1.jpg  ✅ (Existant)
    ├── memory-2.jpg
    ├── memory-3.jpg
    └── memory-4.jpg
```

### Étape 2: Les images s'affichent automatiquement
La galerie détecte et affiche jusqu'à 9 images distribuées sur les murs:
- **Mur avant** (3 cadres)
- **Mur droit** (3 cadres)
- **Mur arrière** (3 cadres)

## 🏛️ Disposition de la salle

```
        [Plafond]
           |||
    [Mur] ← Vous → [Mur]
     Gauche  GAL  Droit
      (30)  (20)  (30)
           |||
        [Sol] (12 haut)
```

### Dimensions
- **Largeur**: 20 unités
- **Hauteur**: 12 unités
- **Profondeur**: 30 unités

### Éléments
- 🖼️ Cadres: 4×3 unités avec bordure en bois
- 🎨 Images: Adaptées automatiquement
- 💡 Éclairage: Directionnel + Ambient + Pointlights
- 🌪️ Ombre et profondeur: Physiquement correctes

## 🎨 Caractéristiques

### Interactivité
✅ Images réactives (agrandissement au survol)  
✅ Éclairage dynamique  
✅ Ombres en temps réel  
✅ Navigation fluide  
✅ Chargement automatique des images

### Performance
⚡ Rendu Three.js optimisé  
📦 Lazy loading des images  
🎯 Culling des objets invisibles  

### Accessibilité
📱 Responsive sur mobile  
♿ Contrôles intuitifs  
🌍 Support multi-navigateurs

## 🔧 Configuration avancée

### Modifier la disposition des cadres
Éditez `src/Gallery3D.tsx` et modifiez le tableau `positions`:

```typescript
const positions: [number, number, number][] = [
  // Front wall
  [-5, 2, -14.5],   // Top-left
  [0, 2, -14.5],    // Top-center
  [5, 2, -14.5],    // Top-right
  // ... plus de cadres
]
```

### Changer les couleurs
Modifiez les matériaux dans le composant `GalleryScene`:
- Murs: `color="#e8dcc4"`
- Sol: `color="#d4c5b0"`
- Plafond: `color="#f5f5f5"`

## 🚀 Navigation entre expériences

La galerie 3D est accessible depuis:
1. **Intro** → "Créer une balade Mimnesko"
2. **Galerie 2D** → Bouton "🎭 Galerie 3D" (top-right)
3. **Galerie 3D** → Bouton "← Retour" (top-left) pour revenir

## 📚 Technologie

- **React Three Fiber** - Rendu 3D déclaratif
- **Three.js** - Moteur 3D WebGL
- **Drei** - Composants React Three réutilisables
- **GSAP** - Animation fluide (galerie 2D)

## ⚠️ Limitations actuelles

- Até 9 images supportées (3×3 murs)
- Les images sont affichées en lecture seule
- Pas d'édition interactive des cadres
- WebGL requis pour le rendu

## 🎯 Améliorations futures

- [ ] Éditer et repositionner les cadres
- [ ] Support de plus de murs/niveaux
- [ ] Lumière ambiante adaptative
- [ ] Galerie multi-pièces
- [ ] Partage des galeries
- [ ] Mode VR

## 📞 Support

Pour toute question ou suggestion, consultez la documentation de:
- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Drei](https://github.com/pmndrs/drei)

---

**Profitez de votre visite virtuelle!** 🎭✨
