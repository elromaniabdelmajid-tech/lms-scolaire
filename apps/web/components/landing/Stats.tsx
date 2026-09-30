import { TrendingUp, Award, Users, BookOpen } from 'lucide-react'

const stats = [
  { icon: Users, value: '1000+', label: 'Élèves actifs', color: 'indigo' },
  { icon: BookOpen, value: '500+', label: 'Cours créés', color: 'purple' },
  { icon: TrendingUp, value: '95%', label: 'Taux de réussite', color: 'green' },
  { icon: Award, value: '50+', label: 'Enseignants', color: 'orange' },
]

const colorClasses: Record<string, string> = {
  indigo: 'text-indigo-600 bg-indigo-100',
  purple: 'text-purple-600 bg-purple-100',
  green: 'text-green-600 bg-green-100',
  orange: 'text-orange-600 bg-orange-100',
}

export function Stats() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div
                  className={`w-16 h-16 ${colorClasses[stat.color]} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}