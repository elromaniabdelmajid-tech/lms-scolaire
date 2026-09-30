import {
  BookOpen,
  Trophy,
  Users,
  MessageSquare,
  BarChart3,
  Upload,
} from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Cours interactifs',
    description: 'Créez des cours structurés avec chapitres, ressources et quiz',
    color: 'indigo',
  },
  {
    icon: Trophy,
    title: 'Gamification',
    description: 'Gagnez des XP, débloquez des badges et suivez votre progression',
    color: 'purple',
  },
  {
    icon: Users,
    title: 'Suivi personnalisé',
    description: 'Les parents suivent la progression de leurs enfants en temps réel',
    color: 'green',
  },
  {
    icon: MessageSquare,
    title: 'Communication',
    description: 'Messagerie intégrée entre enseignants, élèves et parents',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Statistiques',
    description: 'Analysez les performances avec des tableaux de bord détaillés',
    color: 'orange',
  },
  {
    icon: Upload,
    title: 'Import facile',
    description: 'Importez vos questions depuis CSV ou depuis vos banques',
    color: 'pink',
  },
]

const colorClasses: Record<string, string> = {
  indigo: 'bg-indigo-100 text-indigo-600',
  purple: 'bg-purple-100 text-purple-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  pink: 'bg-pink-100 text-pink-600',
}

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tout ce qu'il faut pour{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              réussir
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une plateforme complète avec tous les outils nécessaires pour
            l'enseignement moderne.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${colorClasses[feature.color]} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}