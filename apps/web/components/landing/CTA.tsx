import { SignUpButton } from '@clerk/nextjs'
import { Rocket } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à commencer l'aventure ?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Rejoignez des milliers d'élèves, enseignants et parents qui
            utilisent EduScolaire au quotidien.
          </p>
          <SignUpButton mode="modal">
            <button className="group px-10 py-5 text-lg font-semibold text-indigo-600 bg-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <span className="flex items-center gap-2">
                <Rocket className="w-5 h-5 group-hover:rotate-12 transition" />
                Commencer gratuitement
              </span>
            </button>
          </SignUpButton>
        </div>
      </div>
    </section>
  )
}