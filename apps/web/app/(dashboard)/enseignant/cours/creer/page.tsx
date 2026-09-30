'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { NIVEAUX_GROUPES, MATIERES_GROUPES } from '@lms-scolaire/shared'
import Link from 'next/link'

export default function CreerCours() {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    isPublished: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const course = await api.courses.create({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category || undefined,
        level: formData.level || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        isPublished: formData.isPublished,
      })

      console.log('✅ Cours créé:', course.id)
      router.push(`/enseignant/cours/${course.id}/chapitres`)
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur création cours:', error.message)
        alert(error.message || 'Erreur lors de la création du cours')
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/enseignant"
          className="text-indigo-600 hover:text-indigo-800 mb-6 block"
        >
          ← Retour au tableau de bord
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">📝 Créer un nouveau cours</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du cours *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Introduction à l'algèbre"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Décrivez votre cours..."
              />
            </div>

            {/* Catégorie et Niveau */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Sélectionner...</option>
                  {MATIERES_GROUPES.map((groupe) => (
                    <optgroup key={groupe.label} label={groupe.label}>
                      {groupe.niveaux.map((matiere) => (
                        <option key={matiere} value={matiere}>
                          {matiere}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                >
                  <option value="">Sélectionner...</option>
                  {NIVEAUX_GROUPES.map((groupe) => (
                    <optgroup key={groupe.label} label={groupe.label}>
                      {groupe.niveaux.map((niveau) => (
                        <option key={niveau} value={niveau}>
                          {niveau}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (€)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00 pour gratuit"
              />
            </div>

            {/* Publication */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublished"
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
              />
              <label
                htmlFor="isPublished"
                className="text-sm font-medium text-gray-700"
              >
                Publier immédiatement
              </label>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Création en cours...' : 'Créer le cours'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/enseignant')}
                className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}