'use client'

import { renderLatexToString } from '@/lib/render-latex'

interface QuestionStat {
  id: string
  text: string
  type: string
  points: number
  totalAnswers: number
  correctAnswers: number
  successRate: number
}

interface QuestionStatsProps {
  stats: QuestionStat[]
}

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: '✅ Choix unique',
  MULTIPLE_CHOICE: '☑️ Choix multiple',
  TRUE_FALSE: '⚪ Vrai/Faux',
  TEXT: '✏️ Réponse textuelle'
}

function getDifficultyColor(rate: number): string {
  if (rate >= 80) return 'bg-green-100 text-green-700'
  if (rate >= 60) return 'bg-yellow-100 text-yellow-700'
  if (rate >= 40) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

function getDifficultyLabel(rate: number): string {
  if (rate >= 80) return 'Facile'
  if (rate >= 60) return 'Moyen'
  if (rate >= 40) return 'Difficile'
  return 'Très difficile'
}

export function QuestionStats({ stats }: QuestionStatsProps) {
  if (stats.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">Aucune question dans ce quiz.</p>
    )
  }

  return (
    <div className="space-y-4">
      {stats.map((stat, index) => (
        <div key={stat.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-400 text-sm font-medium">#{index + 1}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                  {TYPE_LABELS[stat.type] || stat.type}
                </span>
                <span className="text-xs text-gray-500">
                  {stat.points} pt{stat.points > 1 ? 's' : ''}
                </span>
              </div>
              <div
                className="font-medium mt-2"
                dangerouslySetInnerHTML={{ __html: renderLatexToString(stat.text) }}
              />
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">
                {stat.correctAnswers} / {stat.totalAnswers} bonnes réponses
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(stat.successRate)}`}>
                {getDifficultyLabel(stat.successRate)} - {stat.successRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  stat.successRate >= 80 ? 'bg-green-500' :
                  stat.successRate >= 60 ? 'bg-yellow-500' :
                  stat.successRate >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${stat.successRate}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}