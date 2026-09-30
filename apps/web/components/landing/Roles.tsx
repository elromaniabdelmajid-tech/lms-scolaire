import { GraduationCap, Users, UserCheck, Shield } from 'lucide-react'

const roles = [
  {
    icon: GraduationCap,
    title: 'Enseignant',
    description: 'Créez vos cours, gérez vos quiz et suivez vos élèves',
    color: 'indigo',
    features: ['Création de cours', 'Gestion des quiz', 'Statistiques'],
  },
  {
    icon: Users,
    title: 'Élève',
    description: 'Suivez vos cours, passez vos quiz et progressez',
    color: 'purple',
    features: ['Accès aux cours', 'Quiz interactifs', 'Badges et XP'],
  },
  {
    icon: UserCheck,
    title: 'Parent',
    description: 'Suivez la progression de vos enfants en temps réel',
    color: 'green',
    features: ['Suivi des enfants', 'Vue globale', 'Notifications'],
  },
  {
    icon: Shield,
    title: 'Admin',
    description: "Gérez la plateforme et supervisez l'activité globale",
    color: 'orange',
    features: ['Gestion utilisateurs', 'Statistiques', 'Modération'],
  },
]

const colorClasses: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    dot: 'bg-indigo-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-200',
    dot: 'bg-purple-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-200',
    dot: 'bg-green-600',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    border: 'border-orange-200',
    dot: 'bg-orange-600',
  },
}

export function Roles() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Pour{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              chaque rôle
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une expérience adaptée à chaque utilisateur.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon
            const colors = colorClasses[role.color]
            return (
              <div
                key={index}
                className={`p-6 bg-white rounded-2xl border-2 ${colors.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              >
                <div
                  className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                <ul className="space-y-2">
                  {role.features.map((feature, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 flex items-center gap-2"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}