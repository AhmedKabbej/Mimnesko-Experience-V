import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import BackButton from '../components/BackButton'
import pathData from '../../public/models/verticesjson.json'
import './ModelViewerScreen.css'

const CURVE = new THREE.CatmullRomCurve3(
  (pathData.points as { x: number; y: number; z: number }[]).map(
    (p) => new THREE.Vector3(p.x, p.y, p.z)
  )
)

const NUM_CHECKPOINTS = pathData.points.length
const houseCenter = new THREE.Vector3()

function Scene({
  progressRef,
  snapTargetRef,
  onObjectClick,
}: {
  progressRef: React.MutableRefObject<number>
  snapTargetRef: React.MutableRefObject<number | null>
  onObjectClick: () => void
}) {
  const { scene } = useGLTF('/models/house.glb')
  const { camera } = useThree()
  const currentLookAt = useRef(new THREE.Vector3())
  const prevProgress = useRef(0)
  const velocity = useRef(0)
  const orbRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene)
    box.getCenter(houseCenter)
    camera.position.copy(CURVE.getPointAt(0))
    currentLookAt.current.copy(houseCenter)
    camera.lookAt(houseCenter)

    if (orbRef.current) {
      orbRef.current.position.copy(houseCenter)
    }
  }, [camera, scene])

  useFrame((_, dt) => {
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

    const t = Math.min(Math.max(progressRef.current, 0), 0.9999)
    const targetPos = CURVE.getPointAt(t)
    camera.position.lerp(targetPos, 0.08)
    currentLookAt.current.lerp(houseCenter, 0.08)
    camera.lookAt(currentLookAt.current)

    if (orbRef.current) {
      orbRef.current.rotation.y += dt * 1.0
    }
  })

  return (
    <>
      <primitive object={scene} scale={0.9} />
      <mesh
        ref={orbRef}
        onClick={(e) => { e.stopPropagation(); onObjectClick() }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#FFD060" emissive="#FF7700" emissiveIntensity={2} metalness={0.9} roughness={0.05} />
      </mesh>
    </>
  )
}

interface ModelViewerScreenProps {
  onBack: () => void
}

export default function ModelViewerScreen({ onBack }: ModelViewerScreenProps) {
  const progressRef = useRef(0)
  const snapTargetRef = useRef<number | null>(null)
  const [popupOpen, setPopupOpen] = useState(false)

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
            onObjectClick={() => setPopupOpen(true)}
          />
        </Suspense>
      </Canvas>

      <BackButton onClick={onBack} />

      {popupOpen && (
        <div className="mvs-popup-backdrop" onClick={() => setPopupOpen(false)}>
          <div className="mvs-popup-card" onClick={(e) => e.stopPropagation()}>
            <button className="mvs-popup-close" onClick={() => setPopupOpen(false)}>×</button>
            <div className="mvs-popup-icon">🏠</div>
            <p className="mvs-popup-text">Souvenir de maison de vacances</p>
          </div>
        </div>
      )}
    </div>
  )
}
