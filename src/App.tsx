import { useState, useEffect, lazy, Suspense } from 'react'
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

// ── Routing : un chemin d'URL par page ──
const PATHS: Record<ExperienceType, string> = {
  intro: '/',
  gallery: '/galerie',
  modelviewer: '/experience',
  settings: '/parametres',
  souvenirs: '/souvenirs',
  balades: '/balades',
}
const EXP_BY_PATH: Record<string, ExperienceType> = Object.fromEntries(
  Object.entries(PATHS).map(([exp, path]) => [path, exp as ExperienceType])
)
const experienceFromPath = (): ExperienceType | null =>
  EXP_BY_PATH[window.location.pathname] ?? null

function App() {
  // ── Deep-linking : on démarre directement sur la page de l'URL ──
  const initialExp = experienceFromPath()
  const deepLinked = initialExp != null && initialExp !== 'intro'
  const onboarded = typeof localStorage !== 'undefined' && localStorage.getItem('mimnesko_onboarded') === '1'
  const skipFlow = deepLinked || onboarded

  const [showOnboarding, setShowOnboarding] = useState(deepLinked ? false : !onboarded)
  const [showIntro, setShowIntro]       = useState(skipFlow ? false : true)
  const [experience, setExperience]     = useState<ExperienceType>(initialExp ?? 'intro')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isReturning, setIsReturning]   = useState(false)

  // Generic transition: pending target + in-progress flag
  const [pendingNav, setPendingNav]     = useState<ExperienceType | null>(null)
  const [isNavTransition, setIsNavTransition] = useState(false)

  // D'où l'expérience 3D a été lancée (pour y revenir au retour).
  const [modelOrigin, setModelOrigin]   = useState<ExperienceType>('intro')

  const { play: playAudio, stop: stopAudio, playRetour } = useSelectionAudio()

  // ── L'URL reflète la page courante (refresh = on reste au même endroit) ──
  useEffect(() => {
    if (showOnboarding) return
    const path = PATHS[experience]
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
  }, [experience, showOnboarding])

  // ── Boutons précédent/suivant du navigateur ──
  useEffect(() => {
    const onPop = () => {
      const exp = experienceFromPath() ?? 'intro'
      setShowOnboarding(false)
      setShowIntro(false)
      setPendingNav(null)
      setIsNavTransition(false)
      setIsTransitioning(false)
      setIsReturning(false)
      setExperience(exp)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

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
    setModelOrigin('gallery')
    setExperience('modelviewer')
  }

  const handleBackFromModel = () => {
    playRetour()
    setExperience(modelOrigin)
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

  const handleStartJourney = () => {
    setModelOrigin('intro')
    navigateTo('modelviewer')
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
    return <OnboardingScreen onComplete={() => { localStorage.setItem('mimnesko_onboarded', '1'); setShowOnboarding(false); setShowIntro(false) }} />
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
          <AnciennesBalades
            onBack={handleNavBack}
            onOpenGallery={handleCreateWalk}
            onLaunchExperience={() => { setModelOrigin('balades'); navigateTo('modelviewer') }}
          />
        </Suspense>
      )}

      {experience === 'intro' && (
        <>
          {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
          <HomeCard
            visible={!showIntro}
            onCreateWalk={handleCreateWalk}
            onSettings={handleOpenSettings}
            onStartJourney={handleStartJourney}
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
