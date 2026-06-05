import { IconHome, IconPhoto, IconRoute } from './icons'
import './BottomNav.css'

type NavScreen = 'intro' | 'souvenirs' | 'balades'

interface BottomNavProps {
  active: NavScreen
  onNavigate: (screen: NavScreen) => void
}

const NAV_ITEMS: { id: NavScreen; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: 'intro',
    label: 'Accueil',
    icon: (a) => <IconHome size={22} className={a ? 'bn-icon--active' : ''} />,
  },
  {
    id: 'souvenirs',
    label: 'Souvenirs',
    icon: (a) => <IconPhoto size={22} className={a ? 'bn-icon--active' : ''} />,
  },
  {
    id: 'balades',
    label: 'Balades',
    icon: (a) => <IconRoute size={22} className={a ? 'bn-icon--active' : ''} />,
  },
]

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="bn-nav" role="navigation" aria-label="Navigation principale">
      {NAV_ITEMS.map(item => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            className={`bn-item${isActive ? ' bn-item--active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.icon(isActive)}
            <span className="bn-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
