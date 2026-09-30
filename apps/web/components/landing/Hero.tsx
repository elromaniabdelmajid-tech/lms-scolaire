import { SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Sparkles, Rocket, LayoutDashboard } from 'lucide-react'

interface HeroProps {
  userId: string | null
}

export function Hero({ userId }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              Plateforme éducative moderne
            </span>
          </div>

          {/* Titre */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
            Apprendre autrement,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              du primaire au lycée
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Une plateforme éducative complète et ludique pour accompagner les
            élèves dans leur parcours scolaire.
          </p>

          {/* CTA */}
          {!userId ? (
            <SignUpButton mode="modal">
              <button className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-slide-up">
                <span className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 group-hover:rotate-12 transition" />
                  Commencer gratuitement
                </span>
              </button>
            </SignUpButton>
          ) : (
            <Link href="/dashboard">
              <button className="group px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-slide-up">
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5" />
                  Aller au tableau de bord
                </span>
              </button>
            </Link>
          )}

          {/* Stats rapides */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in">
            <div>
              <div className="text-3xl font-bold text-indigo-600">1000+</div>
              <div className="text-sm text-gray-600">Élèves actifs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">500+</div>
              <div className="text-sm text-gray-600">Cours créés</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600">50+</div>
              <div className="text-sm text-gray-600">Enseignants</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}