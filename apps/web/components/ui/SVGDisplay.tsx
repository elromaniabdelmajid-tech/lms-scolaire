'use client'

interface SVGDisplayProps {
  svg: string
  className?: string
}

export function SVGDisplay({ svg, className = '' }: SVGDisplayProps) {
  if (!svg || !svg.trim()) return null

  // Nettoyer le SVG (enlever les balises script pour la sécurité)
  const cleanSvg = svg.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  return (
    <div 
      className={`flex justify-center items-center my-4 p-4 bg-gray-50 rounded-lg overflow-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanSvg }} 
    />
  )
}