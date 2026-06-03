import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useTextSplitAnimation(active: boolean) {
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!active) return

    const splitByWords = (el: HTMLElement | null) => {
      if (!el) return []
      const text = el.textContent || ''
      el.innerHTML = text
        .split(/\s+/)
        .map((w) => `<span class="text-word">${w}</span>`)
        .join(' ')
      return gsap.utils.toArray<Element>('.text-word')
    }

    const subtitleWords = splitByWords(subtitleRef.current)
    const titleWords = splitByWords(titleRef.current)

    const tl = gsap.timeline()
    gsap.set([subtitleWords, titleWords, buttonRef.current], { opacity: 0 })
    gsap.set(subtitleWords, { y: 10 })
    gsap.set(titleWords, { y: 10 })

    tl.to(subtitleWords, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: { amount: 0.3 } }, 0)
    tl.to(titleWords, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: { amount: 0.4 } }, 0.5)
    tl.to(buttonRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, 1.1)

    const button = buttonRef.current
    if (!button) return

    const onEnter = () => gsap.to(button, { y: -4, boxShadow: '0px 12px 20px rgba(0,0,0,0.18)', duration: 0.3, overwrite: 'auto' })
    const onLeave = () => gsap.to(button, { y: 0, boxShadow: '0px 8px 12px rgba(0,0,0,0.12)', duration: 0.3, overwrite: 'auto' })

    button.addEventListener('mouseenter', onEnter)
    button.addEventListener('mouseleave', onLeave)
    return () => {
      button.removeEventListener('mouseenter', onEnter)
      button.removeEventListener('mouseleave', onLeave)
    }
  }, [active])

  return { subtitleRef, titleRef, buttonRef }
}
