import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { NotificationBadge } from '@/components/NotificationBadge'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                📚 EduScolaire
              </Link>
              <span className="ml-4 text-sm text-gray-500">
                {new Date().getFullYear()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {/* 🆕 Badge de notifications */}
              <NotificationBadge />
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <main>{children}</main>
    </div>
  )
}