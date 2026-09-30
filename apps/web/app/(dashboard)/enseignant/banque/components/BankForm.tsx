'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { NIVEAUX_GROUPES, SUBJECTS_GROUPES } from '@lms-scolaire/shared'

export function BankForm() {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    level: '',
    isPublic: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const bank = await api.banks.create({
        name: formData.name,
        description: formData.description || undefined,
        subject: formData.subject || undefined,
        level: formData.level || undefined,
        isPublic: formData.isPublic,
      })

      console.log('✅ Banque créée:', bank.id)
      router.refresh()

      // Reset
      setFormData({
        name: '',
        description: '',
        subject: '',
        level: '',
        isPublic: false,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur création banque:', error.message)
        alert(error.message || 'Erreur lors de la création')
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la banque *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Ex: Mathématiques 6ème"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Description de la banque"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matière
          </label>
          <select
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
          >
            <option value="">Sélectionner...</option>
            {SUBJECTS_GROUPES.map((groupe) => (
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

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublic"
          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          checked={formData.isPublic}
          onChange={(e) =>
            setFormData({ ...formData, isPublic: e.target.checked })
          }
        />
        <label
          htmlFor="isPublic"
          className="text-sm font-medium text-gray-700"
        >
          Rendre publique (visible par tous les enseignants)
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? 'Création...' : 'Créer la banque'}
      </button>
    </form>
  )
}