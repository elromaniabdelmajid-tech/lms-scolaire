import { auth, currentUser } from '@clerk/nextjs/server'
import { Navigation } from '@/components/landing/Navigation'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Roles } from '@/components/landing/Roles'
import { Stats } from '@/components/landing/Stats'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

export default async function HomePage() {
  const { userId } = await auth()
  const user = await currentUser()

  const userName =
    user?.firstName || user?.emailAddresses[0]?.emailAddress || null

  return (
    <div className="min-h-screen bg-white">
      <Navigation userId={userId} userName={userName} />
      <Hero userId={userId} />
      <Features />
      <Roles />
      <Stats />
      <CTA />
      <Footer />
    </div>
  )
}