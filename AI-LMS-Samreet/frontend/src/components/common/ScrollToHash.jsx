import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * Scrolls to the element matching the URL hash after navigation.
 * Place <ScrollToHash /> once inside App.js (inside <Routes> wrapper).
 */
const ScrollToHash = () => {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (!hash) return
    // Small delay so the target page has time to render
    const timer = setTimeout(() => {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [hash, pathname])

  return null
}

export default ScrollToHash
