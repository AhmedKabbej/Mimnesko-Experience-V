import { useState, lazy, Suspense } from 'react'
import Intro from './screens/Intro'
import HomeCard from './components/HomeCard'
import LoadingTransition from './components/LoadingTransition'
import { useSelectionAudio } from './hooks/useSelectionAudio'
import './App.css'

const Memory3D = lazy(() => import('./screens/Memory3D'))
const ModelViewerScreen = lazy(() => import('./screens/ModelViewerScreen'))

type ExperienceType = 'intro' | 'gallery' | 'modelviewer'

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [experience, setExperience] = useState<ExperienceType>('intro')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isReturning, setIsReturning] = useState(false)

  const { play: playAudio, stop: stopAudio, playRetour } = useSelectionAudio()

  const handleCreateWalk = () => {
    playAudio()
    setIsTransitioning(true)
  }

  const handleBackFromGallery = () => {
    playRetour()
    stopAudio()
    setIsReturning(true)
  }

  const handleOpenModel = () => {
    stopAudio()
    setExperience('modelviewer')
  }

  const handleBackFromModel = () => {
    playRetour()
    playAudio()
    setExperience('gallery')
  }

  return (
    <>
      {isTransitioning && (
        <LoadingTransition
          onMidpoint={() => setExperience('gallery')}
          onComplete={() => setIsTransitioning(false)}
        />
      )}

      {isReturning && (
        <LoadingTransition
          circleColor="#ffffff"
          textColor="#000000"
          onMidpoint={() => { setExperience('intro'); setShowIntro(false) }}
          onComplete={() => setIsReturning(false)}
        />
      )}

      {experience === 'modelviewer' && (
        <Suspense fallback={null}>
          <ModelViewerScreen onBack={handleBackFromModel} />
        </Suspense>
      )}

      {experience === 'gallery' && (
        <Suspense fallback={null}>
          <Memory3D onBack={handleBackFromGallery} onOpenModel={handleOpenModel} />
        </Suspense>
      )}

      {experience === 'intro' && (
        <>
          {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
          <HomeCard visible={!showIntro} onCreateWalk={handleCreateWalk} />
        </>
      )}
    </>
  )
}

export default App
