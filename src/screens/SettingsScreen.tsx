import { useState } from 'react'
import {
  IconArrowLeft,
  IconDatabase,
  IconShield,
  IconBell,
  IconDownload,
  IconTrash,
} from '../components/icons'
import './SettingsScreen.css'

interface SettingsScreenProps {
  onBack: () => void
}

type SectionId = 'stockage' | 'confidentialite' | 'notifications' | 'gestion'

const NAV_ITEMS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: 'stockage',         label: 'Stockage des données', icon: <IconDatabase size={18} /> },
  { id: 'confidentialite',  label: 'Confidentialité',      icon: <IconShield size={18} /> },
  { id: 'notifications',    label: 'Notifications',        icon: <IconBell size={18} /> },
  { id: 'gestion',          label: 'Gestion des données',  icon: <IconDatabase size={18} /> },
]

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`st-toggle${value ? ' st-toggle--on' : ''}`}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    >
      <span className="st-toggle-thumb" />
    </button>
  )
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [activeSection, setActiveSection] = useState<SectionId>('stockage')
  const [cloudStorage, setCloudStorage]             = useState(true)
  const [provider, setProvider]                     = useState<'mimnesko' | 'infomaniak'>('mimnesko')
  const [autoSync, setAutoSync]                     = useState(true)
  const [cgdAccepted, setCgdAccepted]               = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [syncAlerts, setSyncAlerts]                 = useState(false)

  return (
    <div className="st-screen">

      {/* ── MOBILE LAYOUT ── */}
      <div className="st-mobile">
        <div className="st-header">
          <button className="st-back-btn" onClick={onBack} aria-label="Retour">
            <IconArrowLeft size={18} />
          </button>
          <h1 className="st-title">Paramètres</h1>
        </div>
        <div className="st-divider" />
        <div className="st-mobile-content">
          <SectionStockage cloudStorage={cloudStorage} setCloudStorage={setCloudStorage} provider={provider} setProvider={setProvider} autoSync={autoSync} setAutoSync={setAutoSync} />
          <SectionConfidentialite cgdAccepted={cgdAccepted} setCgdAccepted={setCgdAccepted} />
          <SectionNotifications notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} syncAlerts={syncAlerts} setSyncAlerts={setSyncAlerts} />
          <SectionGestion />
        </div>
      </div>

      {/* ── PC LAYOUT ── */}
      <div className="st-desktop">
        {/* Sidebar */}
        <aside className="st-sidebar">
          <div className="st-sidebar-header">
            <button className="st-back-btn" onClick={onBack} aria-label="Retour">
              <IconArrowLeft size={18} />
              <span>Retour</span>
            </button>
          </div>
          <h1 className="st-sidebar-title">Paramètres</h1>
          <nav className="st-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`st-nav-item${activeSection === item.id ? ' st-nav-item--active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="st-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <main className="st-content">
          {activeSection === 'stockage' && (
            <SectionStockage
              cloudStorage={cloudStorage} setCloudStorage={setCloudStorage}
              provider={provider} setProvider={setProvider}
              autoSync={autoSync} setAutoSync={setAutoSync}
            />
          )}
          {activeSection === 'confidentialite' && (
            <SectionConfidentialite cgdAccepted={cgdAccepted} setCgdAccepted={setCgdAccepted} />
          )}
          {activeSection === 'notifications' && (
            <SectionNotifications
              notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled}
              syncAlerts={syncAlerts} setSyncAlerts={setSyncAlerts}
            />
          )}
          {activeSection === 'gestion' && <SectionGestion />}
        </main>
      </div>

    </div>
  )
}

/* ─────────────────── Section components ─────────────────── */

function SectionStockage({ cloudStorage, setCloudStorage, provider, setProvider, autoSync, setAutoSync }: {
  cloudStorage: boolean; setCloudStorage: (v: boolean) => void
  provider: 'mimnesko' | 'infomaniak'; setProvider: (v: 'mimnesko' | 'infomaniak') => void
  autoSync: boolean; setAutoSync: (v: boolean) => void
}) {
  return (
    <section className="st-section">
      <div className="st-section-header">
        <IconDatabase size={14} />
        <span>STOCKAGE DES DONNÉES</span>
      </div>

      <div className="st-card">
        <div className="st-row">
          <div className="st-row-text">
            <span className="st-label">Activer le stockage cloud</span>
            <span className="st-desc">Sauvegarde automatique des données en ligne</span>
          </div>
          <Toggle value={cloudStorage} onChange={setCloudStorage} />
        </div>
      </div>

      <div className="st-card">
        <div className="st-provider">
          <span className="st-label">Fournisseur de stockage</span>
          <label className="st-radio-row">
            <input type="radio" name="provider" value="mimnesko" checked={provider === 'mimnesko'} onChange={() => setProvider('mimnesko')} />
            <span className="st-radio-label">Cloud Mimnesko</span>
          </label>
          <label className="st-radio-row">
            <input type="radio" name="provider" value="infomaniak" checked={provider === 'infomaniak'} onChange={() => setProvider('infomaniak')} />
            <span className="st-radio-label">Infomaniak [En suisse]</span>
          </label>
          <span className="st-desc">Choisissez où vos données sont hébergées</span>
        </div>
      </div>

      <div className="st-card">
        <div className="st-row">
          <div className="st-row-text">
            <span className="st-label">Synchronisation automatique</span>
            <span className="st-desc">Synchronise les données en temps réel</span>
          </div>
          <Toggle value={autoSync} onChange={setAutoSync} />
        </div>
      </div>
    </section>
  )
}

function SectionConfidentialite({ cgdAccepted, setCgdAccepted }: {
  cgdAccepted: boolean; setCgdAccepted: (v: boolean) => void
}) {
  return (
    <section className="st-section">
      <div className="st-section-header">
        <IconShield size={14} />
        <span>CONFIDENTIALITÉ</span>
      </div>
      <div className="st-card">
        <label className="st-checkbox-row">
          <input type="checkbox" checked={cgdAccepted} onChange={e => setCgdAccepted(e.target.checked)} />
          <div className="st-checkbox-text">
            <span className="st-label">J'accepte les conditions générales de données</span>
            <a href="#" className="st-cgd-link" onClick={e => e.preventDefault()}>Voir les CGD ↗</a>
          </div>
        </label>
      </div>
    </section>
  )
}

function SectionNotifications({ notificationsEnabled, setNotificationsEnabled, syncAlerts, setSyncAlerts }: {
  notificationsEnabled: boolean; setNotificationsEnabled: (v: boolean) => void
  syncAlerts: boolean; setSyncAlerts: (v: boolean) => void
}) {
  return (
    <section className="st-section">
      <div className="st-section-header">
        <IconBell size={14} />
        <span>NOTIFICATIONS</span>
      </div>
      <div className="st-card">
        <div className="st-row">
          <span className="st-label">Notifications activées</span>
          <Toggle value={notificationsEnabled} onChange={setNotificationsEnabled} />
        </div>
      </div>
      <div className="st-card">
        <div className="st-row">
          <span className="st-label">Alertes de synchronisation</span>
          <Toggle value={syncAlerts} onChange={setSyncAlerts} />
        </div>
      </div>
    </section>
  )
}

function SectionGestion() {
  return (
    <section className="st-section">
      <div className="st-section-header">
        <IconDatabase size={14} />
        <span>GESTION DES DONNÉES</span>
      </div>
      <button className="st-card st-action-btn">
        <span className="st-label">Exporter mes données</span>
        <IconDownload size={20} />
      </button>
      <button className="st-card st-action-btn st-action-btn--danger">
        <span className="st-label">Supprimer mes données</span>
        <IconTrash size={20} />
      </button>
    </section>
  )
}
