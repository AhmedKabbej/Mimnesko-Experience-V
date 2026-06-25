# Mimneskō — Proto Experience

Prototype d'expérience web immersive pour **Mimneskō**, un cloud éthique de souvenirs. L'app enchaîne un tunnel d'onboarding, une intro animée, un accueil, une galerie 3D de souvenirs et une expérience 3D scroll-driven (maison + parcours caméra), le tout sur une DA douce et naturelle (sauge → orange).

### Stack

- **React 18** + **TypeScript** + **Vite 6**
- **Three.js** / **@react-three/fiber** / **@react-three/drei** — rendu 3D, scènes GLB, KTX2
- **GSAP** — animations (onboarding, menu radial, transitions)
- **ogl** — effets shader (plasma, gooey search)
- Déploiement **Vercel** (SPA, voir `vercel.json`)

### Scripts

```bash
npm run dev      # serveur de dev (Vite)
npm run build    # tsc -b && vite build → dist/
npm run preview  # prévisualise le build
npm run lint     # ESLint
```

> Docs complémentaires : [`MEMORIES_README.md`](./MEMORIES_README.md) (système de souvenirs) · [`GALLERY_3D_README.md`](./GALLERY_3D_README.md) (galerie 3D). La partie 3D scroll/Three.js est détaillée plus bas.

---

## Navigation — Chemins d'URL des pages

Chaque écran a son URL : on peut y accéder **directement** (deep-link) sans refaire onboarding → intro → parcours. L'URL se met à jour en naviguant, et les boutons précédent/suivant du navigateur fonctionnent.

| URL | Page | Composant | Rôle |
|-----|------|-----------|------|
| `/` | Accueil (intro animée + recherche, plasma) | `Intro` + `HomeCard` | Point d'entrée après l'onboarding |
| `/souvenirs` | Mes souvenirs | `MesSouvenirsScreen` | Collection de souvenirs |
| `/balades` | Anciennes balades | `AnciennesBalades` | Parcours passés ; lance galerie ou expérience 3D |
| `/galerie` | Galerie 3D des souvenirs | `Memory3D` | Sélection 3D → ouvre l'expérience |
| `/experience` | Expérience 3D scroll (scène `scene1.glb` / maison) | `ModelViewerScreen` | Parcours caméra scroll-driven |
| `/promo` | Vidéo promo de fin de parcours | `VideoPromoScreen` | Final de l'expérience 3D |
| `/parametres` | Réglages | `SettingsScreen` | Préférences |

**Parcours type :** onboarding (1ʳᵉ visite) → `/` (intro + accueil) → `/galerie` ou `/balades` → `/experience` → `/promo`.

**Notes :**
- L'onboarding ne s'affiche **qu'une fois** (mémorisé dans `localStorage` → clé `mimnesko_onboarded`). Pour le revoir : `localStorage.removeItem('mimnesko_onboarded')` en console.
- Retour depuis `/experience` : revient à la page d'origine du lancement (`/`, `/galerie` ou `/balades`).
- En **production (Vercel)**, `vercel.json` réécrit toutes les routes vers `index.html` pour que recharger une URL profonde (ex. `/souvenirs`) fonctionne.

---

## Navigation in-app — Menu radial

La navigation principale est un **menu radial** (`RadialMenu`) : un bouton flottant qui déploie ses entrées en éventail (GSAP). Positionnement adaptatif — centré en bas sur desktop, coin bas-droite sur mobile (pour ne rien couper hors écran).

Il n'apparaît que sur les écrans de navigation (`intro`, `souvenirs`, `balades`, `settings`) et jamais pendant l'intro animée.

| Entrée | Cible | Icône |
|--------|-------|-------|
| Accueil | `/` | `IconHome` |
| Souvenirs | `/souvenirs` | `IconPhoto` |
| Balades | `/balades` | `IconRoute` |
| Paramètres | `/parametres` | `IconGear` |

> Les écrans `/galerie`, `/experience` et `/promo` n'ont pas d'entrée dans le menu : on y entre par action (lancer une balade / l'expérience) et on en sort via leur bouton retour dédié.

---

## Navigation Scroll 3D — Notes Blender / Three.js

### 1. Optimisation des modèles 3D

#### Réduire les polygones (Blender)
- Utiliser le modifier **Decimate** pour baisser le triangle count
- Objectif : rester sous ~50k triangles pour du web temps réel
- Chemin : `Properties > Modifier > Decimate` → mode **Collapse**, ajuster le ratio

#### Textures
- **Bake** les textures dans Blender pour intégrer l'éclairage directement sur la texture (lighting → texture, pas en temps réel)
  - `Render Properties > Bake` → type **Combined** ou **Diffuse**
  - Résultat : une texture plate qui contient lumière + ombres
- Exporter en **WebP** format **4:2** (rapport 4 largeur / 2 hauteur) pour réduire le poids
- Convertir en **KTX2** via CLI (format GPU-natif, compression Basis Universal) :
  ```bash
  # Outil : toktx (KTX-Software) ou basisu
  toktx --uastc output.ktx2 input.png
  # ou
  basisu -ktx2 input.png
  ```

---

### 2. KTX2 dans Three.js

Instancier le loader **KTX2Loader** avant de charger le GLB :

```ts
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const ktx2Loader = new KTX2Loader()
  .setTranscoderPath('/basis/')          // dossier avec basis_transcoder.js/.wasm
  .detectSupport(renderer)

const gltfLoader = new GLTFLoader()
gltfLoader.setKTX2Loader(ktx2Loader)
```

---

### 3. Camera Path (scroll-driven)

#### Exporter le path depuis Blender
- Créer une **courbe Bézier** (ou path) dans Blender qui représente la trajectoire de caméra
- Exporter en **GLB** (`File > Export > glTF 2.0`)
- Importer dans Three.js et extraire les points de la courbe

#### Convertir en CatmullRomCurve3 (Three.js)

```ts
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Charger le GLB qui contient le path
const loader = new GLTFLoader()
loader.load('/models/camera-path.glb', (gltf) => {
  const pathObject = gltf.scene.getObjectByName('CameraPath') // nom de la courbe Blender
  const points = pathObject.geometry.attributes.position

  const curvePoints: THREE.Vector3[] = []
  for (let i = 0; i < points.count; i++) {
    curvePoints.push(new THREE.Vector3(
      points.getX(i),
      points.getY(i),
      points.getZ(i)
    ))
  }

  const curve = new THREE.CatmullRomCurve3(curvePoints)
})
```

#### getPointAt — progress de 0 à 1

```ts
// t = progression normalisée du scroll (0 = début, 1 = fin)
const t = scrollY / (document.body.scrollHeight - window.innerHeight)

const position = curve.getPointAt(t)        // Vector3 position sur le path
const lookAtTarget = curve.getPointAt(t + 0.01) // point légèrement en avant → direction

camera.position.copy(position)
camera.lookAt(lookAtTarget)
```

#### Lerp pour fluidifier

```ts
// Dans la boucle d'animation, lerp la position pour éviter les saccades
const targetPos = curve.getPointAt(t)
camera.position.lerp(targetPos, 0.1)        // 0.1 = vitesse d'interpolation (0–1)

const targetLook = curve.getPointAt(Math.min(t + 0.01, 1))
currentLookAt.lerp(targetLook, 0.1)
camera.lookAt(currentLookAt)
```

#### Récupérer le scroll normalisé

```ts
let scrollProgress = 0

window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight
  scrollProgress = window.scrollY / maxScroll  // valeur entre 0 et 1
})

// Dans useFrame (R3F) ou requestAnimationFrame
useFrame(() => {
  const pos = curve.getPointAt(scrollProgress)
  camera.position.lerp(pos, 0.08)
})
```

#### Exporter les vertices du path (alternative via script Blender)

```python
# Script Python dans Blender > Scripting
import bpy, json

obj = bpy.data.objects['CameraPath']
points = [list(v.co) for v in obj.data.vertices]

with open('/path/to/export/camera_path.json', 'w') as f:
    json.dump(points, f)
```

---

### Récap du pipeline complet

```
Blender
  └── Modèle → Decimate → Bake texture → Export WebP/KTX2
  └── Courbe caméra → Export GLB

Three.js / R3F
  └── KTX2Loader + GLTFLoader → charger modèle
  └── Extraire points courbe → CatmullRomCurve3
  └── scroll normalisé (0→1) → curve.getPointAt(t) → Vector3
  └── camera.position.lerp(pos, 0.08) + camera.lookAt(lookAtTarget)
```

---

## Implémentation réelle — ModelViewerScreen

### Path JSON (pas GLB)
- Points exportés depuis Blender via script Python → `public/models/verticesjson.json`
- Format : `{ "points": [{ "x": 0, "y": 0, "z": 0 }, ...] }`
- Construit **hors composant** (une fois au load) : `new THREE.CatmullRomCurve3(points)`

### Scroll → `useRef` pas `useState`
- `progressRef.current` (0→1) mis à jour dans les listeners — **pas de re-render**
- Wheel : `progressRef.current += e.deltaY / 3000`
- Touch : diff `clientY` entre frames → `/ 1000`

### Caméra dans `useFrame`
```ts
const t = Math.min(Math.max(progressRef.current, 0), 0.9999)
camera.position.lerp(CURVE.getPointAt(t), 0.08)
camera.lookAt(houseCenter)   // centre calculé via Box3 au montage
```

### La maison
- `house.glb` chargé via `useGLTF`
- Centre calculé **une fois** au montage : `new THREE.Box3().setFromObject(scene).getCenter(houseCenter)`
- La caméra regarde toujours ce centre — pas de lookAt dynamique sur la courbe




for each sur les mesh pour recup 
ray caster : detecteur
