import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useProgress, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import BackButton from '../components/BackButton'
import { playAmbient, stopAmbient } from '../utils/ambientAudio'
import pathData from '../../public/models/curvePath1.json'
import './ModelViewerScreen.css'

const CURVE = new THREE.CatmullRomCurve3(
  (pathData.points as { x: number; y: number; z: number }[]).map(
    (p) => new THREE.Vector3(p.x, p.y, p.z)
  )
)

const NUM_CHECKPOINTS = pathData.points.length
const UP = new THREE.Vector3(0, 1, 0)

const IMAGE_FILES = [
  '01.jpeg', '02.jpeg', '03.jpeg', '04.jpeg', '05.jpeg', '06.png',
  '07.jpeg', '08.png', '09.jpeg', '010.png', '011.jpeg',
]
const IMAGE_SRCS = IMAGE_FILES.map((f) => `/memories/img/${f}`)

// Un petit texte poétique sur la nostalgie de l'enfance par image.
const MESSAGES = [
  'Le parfum de l’herbe coupée, et cet été qui ne finissait jamais.',
  'On courait pieds nus, persuadés que le monde entier nous attendait.',
  'Les après-midis avaient le goût sucré des promesses tenues.',
  'Quelque part, un enfant rit encore dans la lumière dorée.',
  'On bâtissait des royaumes avec trois cailloux et beaucoup d’amour.',
  'Le soir tombait doucement, et personne n’avait peur du lendemain.',
  'Nos rires résonnent encore entre les murs de cette maison.',
  'Il suffisait d’un rayon de soleil pour que tout devienne magique.',
  'On gardait nos secrets sous les draps, comme des trésors.',
  'Le temps s’étirait, généreux, comme s’il ne devait jamais partir.',
  'Reviens un instant : l’enfance t’attend, là, juste derrière.',
]

// Le ciel entoure la scène : on le rend non éclairé et visible des deux côtés
// (on est à l'intérieur du dôme/des tuiles).
function toSky(src: THREE.MeshStandardMaterial) {
  const sky = new THREE.MeshBasicMaterial({
    color: src.color ? src.color.clone() : new THREE.Color(0xffffff),
    map: src.map ?? null,
    side: THREE.DoubleSide,
    fog: false,
  })
  sky.name = src.name
  return sky
}

function MemoryImages({ onObjectClick }: { onObjectClick: (index: number) => void }) {
  const textures = useTexture(IMAGE_SRCS)
  const refs = useRef<(THREE.Mesh | null)[]>([])

  useEffect(() => {
    textures.forEach((t) => { t.colorSpace = THREE.SRGBColorSpace })
  }, [textures])

  // Positions échelonnées le long du parcours, décalées de côté, et orientées
  // (droites/verticales) face au parcours pour rester lisibles au passage.
  const placements = useMemo(
    () =>
      IMAGE_SRCS.map((_, i) => {
        const t = Math.min((i + 0.5) / IMAGE_SRCS.length, 0.9999)
        const p = CURVE.getPointAt(t)
        const tan = CURVE.getTangentAt(t)
        const side = new THREE.Vector3().crossVectors(tan, UP).normalize()
        const dir = i % 2 === 0 ? 1 : -1
        const pos = p.clone().addScaledVector(side, 0.45 * dir).addScaledVector(UP, 0.12)
        // Yaw pour que la face de l'image regarde vers le parcours (horizontal).
        const yaw = Math.atan2(p.x - pos.x, p.z - pos.z)
        return { pos, yaw }
      }),
    []
  )

  // Légère oscillation : les images flottent.
  useFrame((state) => {
    const time = state.clock.elapsedTime
    for (let i = 0; i < refs.current.length; i++) {
      const m = refs.current[i]
      if (m) m.position.y = placements[i].pos.y + Math.sin(time * 0.8 + i) * 0.04
    }
  })

  return (
    <>
      {placements.map(({ pos, yaw }, i) => {
        const tex = textures[i]
        const img = tex.image as HTMLImageElement | undefined
        const aspect = img ? img.width / img.height : 1
        const h = 0.26
        return (
          <mesh
            key={i}
            ref={(el) => { refs.current[i] = el }}
            position={pos}
            rotation={[0, yaw, 0]} // droite (verticale), face au parcours
            onClick={(e) => { e.stopPropagation(); onObjectClick(i) }}
            onPointerOver={() => { document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = 'auto' }}
          >
            <planeGeometry args={[h * aspect, h]} />
            <meshBasicMaterial map={tex} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        )
      })}
    </>
  )
}

function Scene({
  progressRef,
  snapTargetRef,
  onObjectClick,
  onReady,
}: {
  progressRef: React.MutableRefObject<number>
  snapTargetRef: React.MutableRefObject<number | null>
  onObjectClick: (index: number) => void
  onReady: () => void
}) {
  const { scene } = useGLTF('/models/scene1.glb')
  const { camera, gl } = useThree()
  const prevProgress = useRef(0)
  const velocity = useRef(0)

  // Free-look : orientation de la caméra contrôlée à la souris.
  const yaw = useRef(0)
  const pitch = useRef(0)
  const dragging = useRef(false)
  const moved = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  // Ciel visible de l'intérieur + on masque le cube de fog qui le cachait.
  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return

      // Le gros volume de brouillard masque le ciel : on le cache.
      if (/fog/i.test(mesh.name)) {
        mesh.visible = false
        return
      }

      const isSky =
        /ciel|sky/i.test(mesh.name) ||
        (Array.isArray(mesh.material)
          ? mesh.material.some((m) => /sky|ciel/i.test(m.name))
          : /sky|ciel/i.test((mesh.material as THREE.Material).name))

      if (isSky) {
        mesh.material = Array.isArray(mesh.material)
          ? mesh.material.map((m) => toSky(m as THREE.MeshStandardMaterial))
          : toSky(mesh.material as THREE.MeshStandardMaterial)
      }
    })
  }, [scene])

  // Tout le sous-arbre Suspense est committé ici → GLB ET textures sont prêts.
  useEffect(() => { onReady() }, [onReady])

  useEffect(() => {
    // Orientation initiale : on regarde vers l'avant du parcours.
    camera.position.copy(CURVE.getPointAt(0))
    camera.lookAt(CURVE.getPointAt(0.02))
    const e = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
    yaw.current = e.y
    pitch.current = e.x
  }, [camera])

  // Drag souris → on tourne la vue (yaw/pitch), sans bouger la position.
  useEffect(() => {
    const el = gl.domElement
    const PITCH_LIMIT = Math.PI / 2 - 0.05

    const onDown = (e: PointerEvent) => {
      dragging.current = true
      moved.current = false
      last.current = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }
      if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true
      yaw.current -= dx * 0.005
      pitch.current -= dy * 0.005
      pitch.current = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch.current))
    }
    const onUp = () => { dragging.current = false }

    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [gl])

  useFrame(() => {
    const delta = progressRef.current - prevProgress.current
    prevProgress.current = progressRef.current
    velocity.current = velocity.current * 0.75 + delta * 0.25

    if (snapTargetRef.current === null && Math.abs(velocity.current) < 0.00015) {
      const i = Math.round(progressRef.current * (NUM_CHECKPOINTS - 1))
      const clamped = Math.max(0, Math.min(NUM_CHECKPOINTS - 1, i))
      snapTargetRef.current = clamped / (NUM_CHECKPOINTS - 1)
    }

    if (snapTargetRef.current !== null) {
      progressRef.current += (snapTargetRef.current - progressRef.current) * 0.07
      if (Math.abs(progressRef.current - snapTargetRef.current) < 0.00005) {
        progressRef.current = snapTargetRef.current
        snapTargetRef.current = null
      }
    }

    // La position suit le parcours, l'orientation suit la souris.
    const t = Math.min(Math.max(progressRef.current, 0), 0.9999)
    camera.position.lerp(CURVE.getPointAt(t), 0.08)

    const targetQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    )
    camera.quaternion.slerp(targetQuat, 0.2)
  })

  return (
    <>
      <primitive object={scene} scale={0.9} />
      <MemoryImages
        onObjectClick={(index) => { if (!moved.current) onObjectClick(index) }}
      />
    </>
  )
}

const LOADING_ITEMS = ['Balades', 'Souvenirs', 'Photos', 'Informations', 'Ciel']

function LoadingOverlay() {
  const { progress } = useProgress()
  const doneCount = Math.floor((progress / 100) * LOADING_ITEMS.length)
  return (
    <div className="mvs-loader">
      <div className="mvs-loader-mask" />
      <div className="mvs-loader-content">
        <p className="mvs-loader-title">Chargement du monde</p>
        <p className="mvs-loader-desc">Mimnesko entre en contact avec votre cloud neuronal…</p>
        <ul className="mvs-loader-list">
          {LOADING_ITEMS.map((label, i) => (
            <li key={label} className={i < doneCount ? 'is-done' : ''}>{label}</li>
          ))}
        </ul>
        <div className="mvs-loader-bar">
          <div className="mvs-loader-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="mvs-loader-text">{Math.round(progress)}%</p>
      </div>
    </div>
  )
}

interface ModelViewerScreenProps {
  onBack: () => void
}

export default function ModelViewerScreen({ onBack }: ModelViewerScreenProps) {
  const progressRef = useRef(0)
  const snapTargetRef = useRef<number | null>(null)
  const [popupIndex, setPopupIndex] = useState<number | null>(null)
  const [closing, setClosing] = useState(false)
  const [ready, setReady] = useState(false)
  const mountTime = useRef(performance.now())

  // On garde le loader au moins 5 s pour avoir le temps de tout lire.
  const handleReady = () => {
    const remaining = Math.max(0, 5000 - (performance.now() - mountTime.current))
    setTimeout(() => setReady(true), remaining)
  }

  // Musique d'ambiance à l'arrivée (sans boucle), coupée à la sortie.
  useEffect(() => {
    playAmbient('/mp3/aWarmAscent.mp3')
    return stopAmbient
  }, [])

  // Écran calme de fin : on laisse un temps de recueillement avant de revenir.
  useEffect(() => {
    if (!closing) return
    const id = setTimeout(onBack, 8000)
    return () => clearTimeout(id)
  }, [closing, onBack])

  useEffect(() => {
    let lastTouchY = 0

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      progressRef.current = Math.min(Math.max(progressRef.current + e.deltaY / 3000, 0), 1)
      snapTargetRef.current = null
    }

    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      const dy = lastTouchY - e.touches[0].clientY
      lastTouchY = e.touches[0].clientY
      progressRef.current = Math.min(Math.max(progressRef.current + dy / 1000, 0), 1)
      snapTargetRef.current = null
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <Canvas
        frameloop="always"
        camera={{ fov: 90, near: 0.01, far: 1000 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        <directionalLight position={[0, 5, -5]} intensity={0.6} />

        <Suspense fallback={null}>
          <Scene
            progressRef={progressRef}
            snapTargetRef={snapTargetRef}
            onObjectClick={(index) => setPopupIndex(index)}
            onReady={handleReady}
          />
        </Suspense>
      </Canvas>

      {!ready && <LoadingOverlay />}

      <BackButton onClick={() => setClosing(true)} />

      {closing && (
        <div className="mvs-calm" onClick={onBack}>
          <div className="mvs-calm-inner">
            <p className="mvs-calm-line">Prenez le temps d’y repenser.</p>
            <p className="mvs-calm-line">Fermez les yeux.</p>
            <p className="mvs-calm-line">Remerciez la vie.</p>
          </div>
          <span className="mvs-calm-hint">Touchez pour continuer</span>
        </div>
      )}

      {popupIndex !== null && (
        <div className="mvs-popup-backdrop" onClick={() => setPopupIndex(null)}>
          <div className="mvs-popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="mvs-popup-close" onClick={() => setPopupIndex(null)}>×</button>
            <img className="mvs-popup-img" src={IMAGE_SRCS[popupIndex]} alt="Souvenir" />
            <p className="mvs-popup-text">{MESSAGES[popupIndex]}</p>
          </div>
        </div>
      )}
    </div>
  )
}
