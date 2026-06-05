import { useState, lazy, Suspense } from 'react'
import OnboardingScreen from './screens/OnboardingScreen'
import Intro from './screens/Intro'
import HomeCard from './components/HomeCard'
import LoadingTransition from './components/LoadingTransition'
import RadialMenu from './components/RadialMenu'
import type { NavScreen } from './components/RadialMenu'
import { useSelectionAudio } from './hooks/useSelectionAudio'
import './App.css'

const Memory3D          = lazy(() => import('./screens/Memory3D'))
const ModelViewerScreen = lazy(() => import('./screens/ModelViewerScreen'))
const SettingsScreen    = lazy(() => import('./screens/SettingsScreen'))
const MesSouvenirsScreen = lazy(() => import('./screens/MesSouvenirsScreen'))
const AnciennesBalades  = lazy(() => import('./screens/AnciennesBalades'))

type ExperienceType = 'intro' | 'gallery' | 'modelviewer' | 'settings' | 'souvenirs' | 'balades'
const NAV_SCREENS: ExperienceType[] = ['intro', 'souvenirs', 'balades', 'settings']

function App() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showIntro, setShowIntro]       = useState(true)
  const [experience, setExperience]     = useState<ExperienceType>('intro')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isReturning, setIsReturning]   = useState(false)

  // Generic transition: pending target + in-progress flag
  const [pendingNav, setPendingNav]     = useState<ExperienceType | null>(null)
  const [isNavTransition, setIsNavTransition] = useState(false)

  const { play: playAudio, stop: stopAudio, playRetour } = useSelectionAudio()

  /* ── Gallery flow ── */
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
    setExperience('gallery')
  }

  /* ── Settings ── */
  const handleOpenSettings = () => {
    stopAudio()
    setExperience('settings')
  }

  const handleBackFromSettings = () => {
    setExperience('intro')
  }

  /* ── Generic nav transition (with LoadingTransition) ── */
  const navigateTo = (target: ExperienceType) => {
    if (target === experience) return
    stopAudio()
    setPendingNav(target)
    setIsNavTransition(true)
  }

  const handleNavBack = () => {
    navigateTo('intro')
  }

  /* ── Radial menu handler ── */
  const handleBottomNav = (screen: NavScreen) => {
    if (screen === experience) return
    if (screen === 'intro') {
      stopAudio()
      setPendingNav('intro')
      setIsNavTransition(true)
    } else {
      navigateTo(screen)
    }
  }

  const showNav = NAV_SCREENS.includes(experience) && !showIntro

  // Render ONLY the onboarding — nothing else mounts behind it
  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => { setShowOnboarding(false); setShowIntro(false) }} />
  }

  return (
    <>
      {/* ── Existing gallery transition (black) ── */}
      {isTransitioning && (
        <LoadingTransition
          onMidpoint={() => setExperience('gallery')}
          onComplete={() => setIsTransitioning(false)}
        />
      )}

      {/* ── Returning to intro (white) ── */}
      {isReturning && (
        <LoadingTransition
          circleColor="#ffffff"
          textColor="#000000"
          onMidpoint={() => { setExperience('intro'); setShowIntro(false) }}
          onComplete={() => setIsReturning(false)}
        />
      )}

      {/* ── Generic nav transition ── */}
      {isNavTransition && pendingNav && (
        <LoadingTransition
          circleColor={pendingNav === 'intro' ? '#ffffff' : '#000000'}
          textColor={pendingNav === 'intro' ? '#000000' : '#ffffff'}
          onMidpoint={() => {
            setExperience(pendingNav)
            if (pendingNav === 'intro') setShowIntro(false)
          }}
          onComplete={() => { setIsNavTransition(false); setPendingNav(null) }}
        />
      )}

      {/* ── Screens ── */}

      {experience === 'settings' && (
        <Suspense fallback={null}>
          <SettingsScreen onBack={handleBackFromSettings} />
        </Suspense>
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

      {experience === 'souvenirs' && (
        <Suspense fallback={null}>
          <MesSouvenirsScreen onBack={handleNavBack} />
        </Suspense>
      )}

      {experience === 'balades' && (
        <Suspense fallback={null}>
          <AnciennesBalades onBack={handleNavBack} />
        </Suspense>
      )}

      {experience === 'intro' && (
        <>
          {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
          <HomeCard
            visible={!showIntro}
            onCreateWalk={handleCreateWalk}
            onSettings={handleOpenSettings}
          />
        </>
      )}

      {/* ── Radial menu ── */}
      {showNav && (
        <RadialMenu
          active={experience as NavScreen}
          onNavigate={handleBottomNav}
        />
      )}
    </>
  )
}

export default App
