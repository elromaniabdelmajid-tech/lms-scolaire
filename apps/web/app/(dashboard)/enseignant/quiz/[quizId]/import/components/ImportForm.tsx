'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { renderLatexToString } from '@/lib/render-latex'

interface ImportFormProps {
  quizId: string
}

interface ParsedQuestion {
  question: string
  type: string
  points: number
  svg?: string
  options: { text: string; isCorrect: boolean }[]
}

export function ImportForm({ quizId }: ImportFormProps) {
  const router = useRouter()
  const api = useApiClient()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ParsedQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = parseCSV(text)
        setPreview(parsed)
      } catch (err) {
        setError('Erreur lors de la lecture du fichier CSV')
      }
    }
    reader.readAsText(selectedFile)
  }

  const parseCSV = (text: string): ParsedQuestion[] => {
    const lines = text.split('\n').filter((line) => line.trim())
    if (lines.length < 2) {
      throw new Error(
        'Le fichier CSV doit contenir au moins un en-tête et une ligne',
      )
    }

    const dataLines = lines.slice(1)
    const questions: ParsedQuestion[] = []

    for (const line of dataLines) {
      const values = parseCSVLine(line)

      if (values.length < 4) continue

      const question: ParsedQuestion = {
  question: values[0],
  type: values[1] || 'SINGLE_CHOICE',
  points: parseInt(values[2]) || 1,
  svg: values[3] || undefined,
  options: [],
}

for (let i = 4; i < values.length; i += 2)  {
        const optionText = values[i]
        const isCorrect = values[i + 1]?.toLowerCase() === 'true'

        if (optionText && optionText.trim()) {
          question.options.push({
            text: optionText,
            isCorrect,
          })
        }
      }

      if (question.question && question.options.length > 0) {
        questions.push(question)
      }
    }

    return questions
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  const handleImport = async () => {
    if (preview.length === 0) {
      setError('Aucune question à importer')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await api.quizzes.importCsv(quizId, preview)
      console.log('✅ Import CSV réussi:', result.imported)
      alert(`${result.imported} question(s) importée(s) avec succès !`)
      router.push(`/enseignant/chapitres/${quizId}/quiz`)
      router.refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('❌ Erreur import CSV:', err.message)
        setError(err.message || "Erreur lors de l'import")
      } else {
        console.error('❌ Erreur inconnue:', err)
        setError('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fichier CSV
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {preview.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">
            Aperçu ({preview.length} question{preview.length > 1 ? 's' : ''})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {preview.map((q, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div
                  className="font-medium"
                  dangerouslySetInnerHTML={{
                    __html: renderLatexToString(q.question),
                  }}
                />
                <p className="text-sm text-gray-500">
                  Type: {q.type} • {q.points} pts
                </p>
                <div className="mt-2 space-y-1">
                  {q.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className={
                          opt.isCorrect
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }
                      >
                        {opt.isCorrect ? '✅' : '○'}
                      </span>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: renderLatexToString(opt.text),
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading
              ? 'Import en cours...'
              : `📥 Importer ${preview.length} question(s)`}
          </button>
        </div>
      )}
    </div>
  )
}