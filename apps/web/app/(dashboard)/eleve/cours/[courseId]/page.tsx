import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { ChapterItem } from '../../components/ChapterItem'

interface EleveCoursPageProps {
  params: Promise<{ courseId: string }>
}

export default async function EleveCoursPage({ params }: EleveCoursPageProps) {
  const { courseId } = await params
  const api = await getApiClient()

  let data
  try {
    data = await api.student.getCourse(courseId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement cours:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/eleve')
    }
    throw error
  }

  const { course } = data

  const totalChapters = course.chapters.length
  const completedChapters = course.chapters.filter((ch: any) =>
    ch.progress?.some((p: any) => p.isCompleted),
  ).length
  const progress =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/eleve"
          className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block"
        >
          ← Retour au tableau de bord
        </Link>

        {/* En-tête du cours */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold">{course.title}</h1>
          {course.description && (
            <p className="text-gray-600 mt-2">{course.description}</p>
          )}
          <div className="flex gap-3 mt-3 flex-wrap">
            {course.category && (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                📂 {course.category}
              </span>
            )}
            {course.level && (
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                📚 {course.level}
              </span>
            )}
            {course.instructor && (
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                👨‍🏫 {course.instructor.prenom || ''} {course.instructor.nom || ''}
              </span>
            )}
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progression</span>
                <span className="font-medium text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {completedChapters} / {totalChapters} chapitres
            </span>
          </div>
        </div>

        {/* Chapitres */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">
            📖 Chapitres ({course.chapters.length})
          </h2>

          {course.chapters.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun chapitre pour ce cours.
            </p>
          ) : (
            <div className="space-y-4">
              {course.chapters.map((chapter: any, index: number) => {
                const isCompleted =
                  chapter.progress?.some((p: any) => p.isCompleted) || false
                const resourceCount = chapter.resources.length

                return (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    index={index}
                    isCompleted={isCompleted}
                    resourceCount={resourceCount}
                    courseId={course.id}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}