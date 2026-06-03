import { useEffect, useRef } from 'react'

export function useSelectionAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const retourAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('/mp3/selectionScreen.MP3')
    audioRef.current.preload = 'auto'

    retourAudioRef.current = new Audio('/mp3/retour.MP3')
    retourAudioRef.current.preload = 'auto'

    return () => {
      audioRef.current?.pause()
      retourAudioRef.current?.pause()
    }
  }, [])

  const play = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }

  const stop = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.currentTime = 0
  }

  const playRetour = () => {
    if (!retourAudioRef.current) return
    retourAudioRef.current.currentTime = 0
    retourAudioRef.current.play().catch(() => {})
  }

  return { play, stop, playRetour }
}
