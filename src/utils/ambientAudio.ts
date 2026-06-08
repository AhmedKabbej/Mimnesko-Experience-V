// Lecteur audio d'ambiance partagé : un seul son à la fois, et surtout
// arrêtable depuis n'importe où (ex. en quittant la scène 3D).
let current: HTMLAudioElement | null = null

export function playAmbient(src: string, loop = false) {
  stopAmbient()
  current = new Audio(src)
  current.loop = loop
  current.currentTime = 0
  current.play().catch(() => {})
}

export function stopAmbient() {
  if (current) {
    current.pause()
    current.currentTime = 0
    current = null
  }
}
