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
  const [showRgpd, setShowRgpd]                     = useState(false)

  if (showRgpd) {
    return <RgpdScreen onBack={() => setShowRgpd(false)} />
  }

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
          <SectionConfidentialite cgdAccepted={cgdAccepted} setCgdAccepted={setCgdAccepted} onOpenRgpd={() => setShowRgpd(true)} />
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
            <SectionConfidentialite cgdAccepted={cgdAccepted} setCgdAccepted={setCgdAccepted} onOpenRgpd={() => setShowRgpd(true)} />
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
            <span className="st-radio-label st-radio-label--ik">
              Infomaniak [En suisse] 🇨🇭
              <svg className="st-ik-logo" viewBox="0 0 200 32" fill="none" aria-label="Infomaniak">
                <text x="0" y="25" fontFamily="'Nunito', 'Arial Black', Arial, sans-serif" fontSize="28" fontWeight="900" fill="#0098FF" letterSpacing="-0.5">infomaniak</text>
              </svg>
            </span>
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

function SectionConfidentialite({ cgdAccepted, setCgdAccepted, onOpenRgpd }: {
  cgdAccepted: boolean; setCgdAccepted: (v: boolean) => void; onOpenRgpd: () => void
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
            <a href="#" className="st-cgd-link" onClick={e => { e.preventDefault(); onOpenRgpd() }}>Voir les CGD ↗</a>
          </div>
        </label>
      </div>
      <button className="st-card st-action-btn" onClick={onOpenRgpd}>
        <span className="st-label">Protection des données (RGPD)</span>
        <IconShield size={18} />
      </button>
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

/* ─────────────────── RGPD / Protection des données ─────────────────── */

const RGPD_SECTIONS = [
  {
    icon: <IconShield size={18} />,
    title: 'Chiffrement de bout en bout',
    body: 'Vos fichiers sont chiffrés sur votre appareil avant même de quitter celui-ci. Personne — pas même Mimneskō — ne peut accéder au contenu de vos souvenirs. Les clés de chiffrement restent sous votre contrôle exclusif.',
  },
  {
    icon: <IconDatabase size={18} />,
    title: 'Hébergement en Suisse',
    body: 'En partenariat avec Infomaniak, hébergeur suisse 100% renouvelable. Vos données sont stockées sur des serveurs situés en Suisse, soumis à l’une des législations les plus protectrices au monde en matière de vie privée. Zéro climatisation, récupération de chaleur, démarche éthique et écologique.',
  },
  {
    icon: <IconShield size={18} />,
    title: 'Propriété & contrôle total',
    body: 'Vous restez l’unique propriétaire de vos photos, vidéos et souvenirs. Mimneskō n’exploite, ne revend et ne monétise jamais vos données. Aucune publicité, aucun profilage, aucun traçage commercial. [100% vous appartient].',
  },
  {
    icon: <IconShield size={18} />,
    title: 'Transparence & open-source',
    body: 'Le code de Mimneskō est ouvert et auditable. Notre fonctionnement est transparent : vous pouvez vérifier par vous-même comment vos données sont traitées et protégées à chaque étape.',
  },
]

const RGPD_RIGHTS = [
  { label: 'Droit d’accès', desc: 'Consulter l’ensemble des données vous concernant.' },
  { label: 'Droit de rectification', desc: 'Corriger toute information inexacte.' },
  { label: 'Droit à l’effacement', desc: 'Supprimer définitivement vos données à tout moment.' },
  { label: 'Droit à la portabilité', desc: 'Exporter vos données dans un format réutilisable.' },
  { label: 'Droit d’opposition', desc: 'Vous opposer à un traitement de vos données.' },
  { label: 'Droit à la limitation', desc: 'Restreindre l’usage de vos données.' },
]

function RgpdScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="rgpd-screen">
      <div className="rgpd-container">
        {/* Header */}
        <div className="rgpd-header">
          <button className="st-back-btn" onClick={onBack} aria-label="Retour">
            <IconArrowLeft size={18} />
            <span>Retour</span>
          </button>
        </div>

        <div className="rgpd-content">
          {/* Hero */}
          <div className="rgpd-hero">
            <div className="rgpd-hero-icon"><IconShield size={28} /></div>
            <h1 className="rgpd-title">Protection des données</h1>
            <p className="rgpd-subtitle">
              Mimneskō honore vos souvenirs au lieu de les exploiter.
              Voici comment vos données sont protégées, conformément au RGPD.
            </p>
          </div>

          {/* Engagement cards */}
          <div className="rgpd-cards">
            {RGPD_SECTIONS.map((s, i) => (
              <div className="rgpd-card" key={i}>
                <div className="rgpd-card-icon">{s.icon}</div>
                <div className="rgpd-card-text">
                  <h3 className="rgpd-card-title">{s.title}</h3>
                  <p className="rgpd-card-body">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rights */}
          <h2 className="rgpd-section-title">Vos droits</h2>
          <div className="rgpd-rights">
            {RGPD_RIGHTS.map((r, i) => (
              <div className="rgpd-right" key={i}>
                <span className="rgpd-right-check">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div>
                  <span className="rgpd-right-label">{r.label}</span>
                  <span className="rgpd-right-desc">{r.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="rgpd-contact">
            <h3 className="rgpd-card-title">Exercer vos droits</h3>
            <p className="rgpd-card-body">
              Pour toute demande relative à vos données personnelles, contactez notre
              délégué à la protection des données :
            </p>
            <a href="mailto:privacy@mimnesko.app" className="rgpd-contact-mail">privacy@mimnesko.app</a>
          </div>

          <p className="rgpd-footer">
            Dernière mise à jour : juin 2026 · MIMNESKŌ © 2026 · A POETIC RESISTANCE
          </p>
        </div>
      </div>
    </div>
  )
}
