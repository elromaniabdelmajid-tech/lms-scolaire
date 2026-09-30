'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string | null
    category: string | null
    level: string | null
    chapters: { id: string }[]
    enrollments: { id: string }[]
  }
  isEnrolled: boolean
  progress: number
}

export function CourseCard({ course, isEnrolled, progress }: CourseCardProps) {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)

  const handleEnroll = async () => {
    setLoading(true)
    try {
      const result = await api.enrollments.enroll({ courseId: course.id })
      console.log('✅ Inscription réussie:', result.message)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          alert('Vous êtes déjà inscrit à ce cours')
        } else if (error.status === 403) {
          alert('Ce cours n\'est pas disponible')
        } else {
          alert(error.message || 'Erreur lors de l\'inscription')
        }
      } else {
        alert('Une erreur est survenue')
      }
      console.error('Erreur inscription:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition flex flex-col">
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{course.title}</h3>
          {course.level && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {course.level}
            </span>
          )}
        </div>
        {course.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {course.description}
          </p>
        )}
        <div className="mt-2 flex gap-2 flex-wrap">
          {course.category && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {course.category}
            </span>
          )}
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {course.chapters.length} chapitres
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {course.enrollments.length} élèves
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        {isEnrolled ? (
          <div className="flex justify-between items-center">
            <Link href={`/eleve/cours/${course.id}`}>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition w-full">
                Continuer
              </button>
            </Link>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% terminé
            </span>
          </div>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition w-full disabled:opacity-50"
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        )}
      </div>
    </div>
  )
}