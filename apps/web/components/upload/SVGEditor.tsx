'use client'

import { useState, useRef } from 'react'
import { SVGDisplay } from '@/components/ui/SVGDisplay'

interface SVGEditorProps {
  value: string
  onChange: (svg: string) => void
}

const SVG_EXAMPLES = [
  {
    name: 'Cercle',
    svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#e0e7ff" stroke="#4f46e5" stroke-width="3"/>
  <text x="100" y="110" text-anchor="middle" font-size="20" fill="#4f46e5">Cercle</text>
</svg>`
  },
  {
    name: 'Triangle rectangle',
    svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,150 150,150 50,50" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/>
  <polyline points="50,130 70,130 70,150" fill="none" stroke="#2563eb" stroke-width="2"/>
  <text x="100" y="175" text-anchor="middle" font-size="14" fill="#2563eb">Base</text>
  <text x="25" y="100" text-anchor="middle" font-size="14" fill="#2563eb" transform="rotate(-90,25,100)">Hauteur</text>
</svg>`
  },
  {
    name: 'Graphique',
    svg: `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <line x1="40" y1="160" x2="280" y2="160" stroke="#000" stroke-width="2"/>
  <line x1="40" y1="160" x2="40" y2="20" stroke="#000" stroke-width="2"/>
  <polyline points="40,160 100,120 160,80 220,40 280,20" fill="none" stroke="#4f46e5" stroke-width="3"/>
  <text x="160" y="190" text-anchor="middle" font-size="12">x</text>
  <text x="20" y="90" text-anchor="middle" font-size="12" transform="rotate(-90,20,90)">y</text>
</svg>`
  },
  {
    name: 'Carré',
    svg: `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="100" height="100" fill="#fef3c7" stroke="#f59e0b" stroke-width="3"/>
  <text x="100" y="110" text-anchor="middle" font-size="16" fill="#f59e0b">Carré</text>
</svg>`
  }
]

export function SVGEditor({ value, onChange }: SVGEditorProps) {
  const [showPreview, setShowPreview] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertExample = (svg: string) => {
    onChange(svg)
    setError(null)
    setShowPreview(true)
  }

  const validateSVG = (content: string): boolean => {
    if (!content.trim()) {
      setError('Le code SVG est vide.')
      return false
    }

    if (!content.toLowerCase().includes('<svg')) {
      setError('Le contenu ne semble pas être un fichier SVG valide.')
      return false
    }

    return true
  }

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.svg')) {
      setError('Le fichier doit être au format SVG.')
      return
    }

    if (file.size > 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 1 Mo.')
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result as string

      if (validateSVG(content)) {
        onChange(content)
        setError(null)
        setShowPreview(true)
      }
    }

    reader.onerror = () => {
      setError('Impossible de lire le fichier SVG.')
    }

    reader.readAsText(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      processFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]

    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const clearSVG = () => {
    onChange('')
    setError(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-5 border rounded-xl p-5 bg-white shadow-sm">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            🎨 Schéma SVG
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Ajoutez un schéma géométrique ou scientifique à votre question.
          </p>
        </div>

        <div className="flex gap-2">
          {value && (
            <button
              type="button"
              onClick={clearSVG}
              className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition"
            >
              🗑️ Effacer
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
          >
            {showPreview ? 'Masquer l’aperçu' : 'Afficher l’aperçu'}
          </button>
        </div>
      </div>

      {/* Zone d'import */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="space-y-2">
          <div className="text-3xl">📁</div>

          <p className="text-sm font-semibold text-gray-700">
            Glissez-déposez un fichier SVG ici
          </p>

          <p className="text-sm text-gray-500">
            ou cliquez pour sélectionner un fichier
          </p>

          <p className="text-xs text-gray-400">
            Format accepté : .svg — Taille maximale : 1 Mo
          </p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Exemples SVG */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Cliquez sur un exemple pour insérer automatiquement un schéma SVG :
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Vous pouvez ensuite modifier le code directement.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {SVG_EXAMPLES.map((example) => (
            <button
              key={example.name}
              type="button"
              onClick={() => insertExample(example.svg)}
              className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 hover:border-indigo-300 transition"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Éditeur de code SVG */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Ou collez le code SVG
        </label>

        <textarea
          rows={8}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setError(null)
          }}
          placeholder={`<svg width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="80" />
</svg>`}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm resize-y"
        />

        <p className="text-xs text-gray-400">
          Vous pouvez coller directement votre code SVG ou modifier un exemple existant.
        </p>
      </div>

      {/* Aperçu SVG */}
      {showPreview && value && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Aperçu du schéma
            </p>

            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              SVG valide
            </span>
          </div>

          <SVGDisplay svg={value} />
        </div>
      )}

    </div>
  )
}