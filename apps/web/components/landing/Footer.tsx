import { GraduationCap, Mail, Globe } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-8 h-8 text-indigo-400" />
              <span className="text-xl font-bold text-white">EduScolaire</span>
            </div>
            <p className="text-sm text-gray-400">
              La plateforme LMS pour l'éducation moderne.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Produit</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-indigo-400 transition">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-indigo-400 transition">
                  Pour qui ?
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:contact@eduscolaire.fr"
                  className="hover:text-indigo-400 transition"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-400 transition">
                  CGU
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} EduScolaire. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:contact@eduscolaire.fr"
              className="text-gray-400 hover:text-indigo-400 transition"
            >
              <Mail className="w-5 h-5" />
            </a>
            <a
              href="https://eduscolaire.fr"
              className="text-gray-400 hover:text-indigo-400 transition"
            >
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}