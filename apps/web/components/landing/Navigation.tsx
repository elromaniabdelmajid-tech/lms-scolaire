import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import { GraduationCap } from 'lucide-react'

interface NavigationProps {
  userId: string | null
  userName: string | null
}

export function Navigation({ userId, userName }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            EduScolaire
          </span>
        </div>
        <div className="flex items-center gap-3">
          {userId ? (
            <>
              <span className="hidden md:block text-sm text-gray-600">
                {userName}
              </span>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                  Se connecter
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:shadow-lg transition">
                  S'inscrire
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}