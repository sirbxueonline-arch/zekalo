import { useEffect } from 'react'

/**
 * useSEO — lightweight per-page meta tag updater (no external deps)
 * Updates document.title, meta description, og tags, canonical
 */
export function useSEO({ title, description, canonical, keywords } = {}) {
  useEffect(() => {
    const base = 'Zirva'
    const fullTitle = title ? `${title} — ${base}` : `${base} — Azərbaycanın №1 Məktəb Platforması`

    // Title
    document.title = fullTitle

    // Helper: set or create a meta tag
    const setMeta = (selector, attr, value) => {
      if (!value) return
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const [attrName, attrVal] = attr.split('=')
        el.setAttribute(attrName.replace('[','').replace(']',''), attrVal.replace(/"/g,''))
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    setMeta('meta[name="description"]',       'name=description',       description)
    setMeta('meta[name="keywords"]',          'name=keywords',          keywords)
    setMeta('meta[property="og:title"]',      'property=og:title',      fullTitle)
    setMeta('meta[property="og:description"]','property=og:description',description)
    setMeta('meta[name="twitter:title"]',     'name=twitter:title',     fullTitle)
    setMeta('meta[name="twitter:description"]','name=twitter:description',description)

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', `https://tryzirva.com${canonical}`)
      setMeta('meta[property="og:url"]', 'property=og:url', `https://tryzirva.com${canonical}`)
    }
  }, [title, description, canonical, keywords])
}
