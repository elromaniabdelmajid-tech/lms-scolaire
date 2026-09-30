'use client'

import { useEffect, useRef } from 'react'
import katex from 'katex'

interface LaTeXProps {
  content: string
  display?: boolean
  className?: string
}

export function LaTeX({
  content,
  display = false,
  className = '',
}: LaTeXProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    if (!content || !content.trim()) {
      container.innerHTML = ''
      return
    }

    // Nettoyage des antislashs échappés provenant du texte
    const cleanedContent = content
      .replace(/\\\\/g, '\\')

    try {
      katex.render(cleanedContent, container, {
        displayMode: display,
        throwOnError: false,
        trust: true,
      })
    } catch (error) {
      console.error('Erreur KaTeX :', error)
      container.textContent = cleanedContent
    }
  }, [content, display])

  return (
    <span
      ref={containerRef}
      className={className}
    />
  )
}