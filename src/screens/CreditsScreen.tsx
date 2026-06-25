import { useEffect, useRef } from 'react'
import BackButton from '../components/BackButton'
import './CreditsScreen.css'

interface CreditsScreenProps {
  onBack: () => void
}

const OUTILS = [
  'Miro', 'Notion', 'Figma', 'VS Code', 'After Effects',
  'Adobe Illustrator', 'Photoshop', 'Media Encoder',
]

const TECHNOS = [
  'WebGL', 'Three.js', 'React Three Fiber', 'HTML', 'CSS', 'JavaScript',
  'TypeScript', 'React', 'Blender 3D', 'Path JSON', 'GSAP',
]

const FILMS = [
  'Severance', 'The Cell', 'eXistenZ', 'Minority Report', 'Memento', 'Vice Versa',
]

const JEUX = [
  'Season: A Letter to the Future', 'GRIS / GREY', 'Monument Valley',
  'Life is Strange', 'Limbo', 'Reanimal',
]

const BUDGET = [
  { w: 'UX Research',     charge: '10 jours', tjm: '8 000 €',  range: '5k–10k' },
  { w: 'Dir. Artistique', charge: '10 jours', tjm: '8 000 €',  range: '8k–15k' },
  { w: 'Creative Dev',    charge: '20 jours', tjm: '16 000 €', range: '15k–30k' },
  { w: 'Dev Web',         charge: '20 jours', tjm: '16 000 €', range: '10k–20k' },
  { w: 'Cloud / Infra',   charge: '10 jours', tjm: '8 000 €',  range: '5k–12k' },
  { w: 'Sound Design',    charge: '5 jours',  tjm: '4 000 €',  range: '2k–6k' },
  { w: 'Tests Users',     charge: '5 jours',  tjm: '4 000 €',  range: '3k–7k' },
  { w: 'Finalisation',    charge: '10 jours', tjm: '8 000 €',  range: '2k–5k' },
]

const TRADES = [
  { title: 'UX Research',       items: ['Études utilisateurs (interviews, tests…)', 'Benchmark Cloud', 'Travail émotionnel', 'Synthèse, persona, parcours'] },
  { title: 'DA (Dir. Art.)',    items: ['Concept visuel', "Design d'interface immersive", 'Design System', 'Prototypage (Figma, interactif)'] },
  { title: 'Creative Dev / 3D', items: ['3D assets + environnements', 'Spatialisation des souvenirs', 'Scrollytelling avancé', 'Motion design', 'Optimisation performances'] },
  { title: 'Dev Web',           items: ['Intégration technique', 'Responsive / Mobile', 'Gestion des médias (upload)', 'Compatibilités navigateurs'] },
  { title: 'Cloud éthique',     items: ['Setup cloud perso souverain', 'Installation hébergements', 'Test sécurité & accessibilité', 'Audit infrastructure éthique'] },
  { title: 'Sound Design',      items: ['Ambiance sonore immersive', 'Intégration audio interactive', 'Narration & Soundscapes'] },
  { title: 'Test utilisateurs', items: ['Tests réels (cibles 18–30 ans)', 'UX simplifiée pour installation', 'Ajustements UX émotion', 'Debug & amélioration'] },
  { title: 'Déploiement',       items: ['Mise en ligne finale', 'Optimisation finale', 'Vérification SEO & Analytics'] },
]

const CHECKLIST = [
  { title: '1 · Assets visuels',                items: ['Modèles 3D (low-poly / high-poly)', 'Textures (PBR, procédurales, organique, métal, verre…)', 'Shaders (distorsion, glitch, liquide, holographique)', 'Backgrounds (fixes ou animés)', 'Particules (systèmes dynamiques)', 'Éclairage (HDRI, lumières dynamiques)'] },
  { title: '2 · Design system (UI)',            items: ['Boutons (plusieurs variantes)', 'Navigation (menu, navbar, 3D / flottante)', 'Cards / blocs de contenu', 'Modals / overlays', 'Tooltips', 'Sliders / contrôles', 'Inputs', 'Loaders / états de chargement'] },
  { title: '3 · États & interactions',          items: ['Hover states (important en 3D)', 'Active / click states', 'Focus states (accessibilité)', 'Transitions entre composants', 'Micro-interactions (feedback)', 'États désactivés / erreurs'] },
  { title: '4 · Architecture 3D',               items: ['Scène principale (hero)', 'Scènes secondaires / sections', 'Objets interactifs', 'Caméra (positions, transitions, contraintes)', "Points d'intérêt (zones interactives)"] },
  { title: '5 · Animation & motion',            items: ["Animations d'introduction", 'Animations au scroll', "Boucles d'animation (idle)", 'Transitions entre scènes', 'Timeline globale (synchronisation)'] },
  { title: '6 · Typographie',                   items: ['Choix de fonts (web + expérimentales)', 'Hiérarchie typographique', 'Texte animé', 'Texte intégré en 3D (extrusion, déformation)'] },
  { title: '7 · Navigation & UX',               items: ['Structure de navigation (linéaire / exploratoire)', 'Indicateurs visuels (où cliquer, où aller)', 'Curseur personnalisé', 'Feedback visuel clair'] },
  { title: '8 · Sound design',                  items: ["Sons d'interaction (bouton)", 'Ambiance sonore', 'Feedback audio subtil'] },
  { title: '9 · Performance & technique',       items: ['Optimisation des meshes', 'Compression des textures', 'Lazy loading', 'Fallback (sans WebGL)', 'Adaptation mobile'] },
  { title: '10 · Direction artistique',         items: ['Palette de couleurs', 'Références visuelles', 'Cohérence globale (UI + 3D)', 'Moodboard', 'Intention émotionnelle'] },
  { title: '11 · Avancé (optionnel)',           items: ['Interaction webcam / gyroscope', 'Génération procédurale', 'Data visualisation en 3D', 'Narration interactive'] },
]

// Générique de fin façon cinéma : fond noir, défilement vertical, DA orange & blanche.
export default function CreditsScreen({ onBack }: CreditsScreenProps) {
  // Musique des crédits : démarre dès l'ouverture de l'écran, s'arrête au retour.
  const audioRef = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    const audio = new Audio('/mp3/Departure.mp3')
    audio.loop = true
    audio.volume = 0.85
    audioRef.current = audio
    audio.play().catch(() => { /* autoplay non bloquant */ })
    return () => { audio.pause(); audioRef.current = null }
  }, [])

  // Défilement auto façon générique — se met en pause quand on scrolle à la main,
  // puis reprend. On peut ainsi tout lire à son rythme.
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const SPEED = 42 // px / seconde
    let raf = 0
    let last = 0
    let pausedUntil = 0
    let pos = el.scrollTop // accumulateur flottant (scrollTop arrondit à l'entier)
    const bump = () => { pausedUntil = performance.now() + 1500 }

    el.addEventListener('wheel', bump, { passive: true })
    el.addEventListener('touchstart', bump, { passive: true })
    el.addEventListener('pointerdown', bump, { passive: true })

    const tick = (t: number) => {
      if (!last) last = t
      const dt = (t - last) / 1000
      last = t
      if (performance.now() > pausedUntil) {
        pos += SPEED * dt
        el.scrollTop = pos
      } else {
        pos = el.scrollTop // resync après un scroll manuel
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('wheel', bump)
      el.removeEventListener('touchstart', bump)
      el.removeEventListener('pointerdown', bump)
    }
  }, [])

  return (
    <div className="credits-screen">
      <BackButton onClick={onBack} />

      <div className="credits-scroll" ref={scrollRef}>
      <div className="credits-roll">
        {/* En-tête */}
        <h1 className="credits-logo">Mimneskō</h1>
        <p className="credits-tagline">A Poetic Resistance</p>

        <div className="credits-rule" />

        {/* Les créateurs */}
        <p className="credits-label">Les créateurs</p>

        <div className="credits-person">
          <p className="credits-role">Graphiste &amp; Webdesign</p>
          <h2 className="credits-name">Enby Pabst</h2>
          <p className="credits-bio">
            Son mémoire portait sur l'espace négatif et son usage en tant qu'outil
            structurel et sémantique dans le graphisme, le web et dans d'autres structures
            de composition. Son rôle dans l'équipe a été de structurer les recherches UX,
            de définir la proposition de valeur et de penser la navigation. Sa direction
            artistique s'est construite sur les codes du Swiss Design, avec un travail de
            production fortement concentré sur le développement de la 3D dans l'expérience
            interactive.
          </p>
        </div>

        <div className="credits-person">
          <p className="credits-role">Creative Technologist &amp; UI/UX Designer</p>
          <h2 className="credits-name">Ahmed Kabbej</h2>
          <p className="credits-bio">
            Son mémoire portait sur l'immersion et la transformation d'une interaction
            numérique en expérience émotionnelle, à travers la lumière, le rythme et la
            donnée. Son rôle a été d'analyser des œuvres et des théories du design pour
            comprendre comment une interface peut devenir sensible et mémorable. Son projet
            MADE explore une interface où la donnée devient une atmosphère, avec Three.js
            et WebGL.
          </p>
        </div>

        <div className="credits-rule" />

        {/* Partenaire principal */}
        <p className="credits-label">Partenaire principal</p>
        <h3 className="credits-partner">Infomaniak</h3>
        <p className="credits-partner-note">
          Hébergeur suisse, 100&nbsp;% renouvelable. Vos données restent en Suisse —
          transfert et stockage soumis à l'une des législations les plus protectrices
          au monde, dans une démarche éthique et écologique.
        </p>

        <div className="credits-rule" />

        {/* Musique & Son */}
        <p className="credits-label">Musique &amp; Son</p>
        <h3 className="credits-partner">Monument Valley 2</h3>
        <p className="credits-partner-note">
          Musiques principales issues de la bande originale du jeu
          <em> Monument Valley&nbsp;2</em> (Original Soundtrack).
        </p>
        <p className="credits-credit-line">Bruitages &amp; design sonore — ElevenLabs</p>

        <div className="credits-rule" />

        {/* Outils */}
        <p className="credits-label">Outils</p>
        <ul className="credits-tags">
          {OUTILS.map((t) => <li key={t} className="credits-tag">{t}</li>)}
        </ul>

        {/* Technologies */}
        <p className="credits-label credits-label--mt">Technologies</p>
        <ul className="credits-tags">
          {TECHNOS.map((t) => <li key={t} className="credits-tag credits-tag--tech">{t}</li>)}
        </ul>

        <div className="credits-rule" />

        {/* Production & budget */}
        <p className="credits-label">Production &amp; budget</p>
        <table className="credits-budget">
          <thead>
            <tr><th>Workflow</th><th>Charge</th><th>Budget TJM</th><th>Fourchette</th></tr>
          </thead>
          <tbody>
            {BUDGET.map((b) => (
              <tr key={b.w}>
                <td>{b.w}</td>
                <td>{b.charge}</td>
                <td className="credits-budget-num">{b.tjm}</td>
                <td>{b.range}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="credits-total">
          <p className="credits-total-label">Budget de synthèse</p>
          <p className="credits-total-value">72 000 €</p>
          <p className="credits-total-range">Range contractuel : 50 000 € à 105 000 €</p>
        </div>

        <div className="credits-rule" />

        {/* Corps de métier & missions */}
        <p className="credits-label">Corps de métier &amp; missions</p>
        <div className="credits-trades">
          {TRADES.map((t) => (
            <div className="credits-trade" key={t.title}>
              <p className="credits-trade-title">{t.title}</p>
              <ul>{t.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="credits-note">
          Ce document présente la structure financière et technique du projet Mimneskō.
          L'accent est mis sur la souveraineté numérique et l'immersion sensorielle
          (3D / Son) pour les cibles jeunes adultes.
        </p>

        <div className="credits-rule" />

        {/* Assets & design system */}
        <p className="credits-label">Assets &amp; design system</p>
        <p className="credits-partner-note">
          Assets 2D / 3D et composants réutilisables (boutons, navigation, icônes) —
          vers une potentielle librairie de composants type <em>shadcn/ui</em>.
        </p>
        <div className="credits-checklist">
          {CHECKLIST.map((g) => (
            <div className="credits-check-group" key={g.title}>
              <h4>{g.title}</h4>
              <ul>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
            </div>
          ))}
        </div>

        <div className="credits-rule" />

        {/* Direction artistique */}
        <p className="credits-label">Direction artistique</p>
        <p className="credits-partner-note">
          Une direction artistique <em>physique</em>, dans l'esprit de Dieter Rams —
          pour la physicalité des objets, des matières et des interfaces.
        </p>

        <div className="credits-rule" />

        {/* Études menées */}
        <p className="credits-label">Études menées</p>
        <h3 className="credits-partner">Étude de cas — Data Scraping</h3>
        <p className="credits-partner-note">
          L'une des études les plus importantes pour le lancement du sujet :
          comprendre la collecte massive de données afin de penser une alternative
          respectueuse de la vie privée.
        </p>

        <div className="credits-rule" />

        {/* Inspirations */}
        <p className="credits-label">Films &amp; séries — inspirations</p>
        <ul className="credits-tags">
          {FILMS.map((t) => <li key={t} className="credits-tag">{t}</li>)}
        </ul>

        <p className="credits-label credits-label--mt">Jeux vidéo — inspirations</p>
        <ul className="credits-tags">
          {JEUX.map((t) => <li key={t} className="credits-tag">{t}</li>)}
        </ul>

        <div className="credits-rule" />

        {/* Remerciements */}
        <p className="credits-label">Remerciements</p>
        <ul className="credits-thanks">
          <li>Ahcene Oumedah</li>
        </ul>

        <div className="credits-rule" />

        {/* Professeurs */}
        <p className="credits-label">Professeurs</p>
        <ul className="credits-thanks">
          <li>Thomas Adam-Garnung</li>
          <li>Christian Porri</li>
          <li>Alexis Séjourné</li>
          <li>Vincent Caruso</li>
        </ul>

        <div className="credits-rule" />

        {/* École */}
        <div className="credits-school">
          <p className="credits-school-name">Gobelins Paris</p>
          <p className="credits-school-prog">DN MADe — UI/UX &amp; Numérique</p>
          <p className="credits-promo">Promo 2026</p>
        </div>

        <div className="credits-rule" />

        {/* Le cloud Mimneskō */}
        <p className="credits-label">Le cloud Mimneskō</p>
        <p className="credits-partner-note">
          Précommande &amp; achat du cloud (hypothétique) :
        </p>
        <a
          className="credits-link"
          href="https://mimnesko.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          mimnesko.vercel.app
        </a>
        <p className="credits-credit-line">
          Guide d'utilisation &amp; installation du cloud téléchargeable dans
          Paramètres → Gestion des données.
        </p>

        <div className="credits-rule" />

        <p className="credits-disclaimer">
          Mimneskō a pour vocation de promouvoir <strong>Infomaniak</strong> plutôt que
          la communication des GAFAM. Ce projet n'est qu'une démonstration — une idée
          novatrice destinée à être vendue puis développée par la suite.
        </p>

        <p className="credits-copyright">MIMNESKŌ © 2026 · A POETIC RESISTANCE · Juin 2026</p>

        <button className="credits-exit" onClick={onBack}>Revenir aux paramètres</button>
      </div>
      </div>
    </div>
  )
}
