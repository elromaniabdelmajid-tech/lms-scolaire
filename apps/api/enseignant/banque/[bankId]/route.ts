import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ bankId: string }> | { bankId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'ENSEIGNANT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const bankId = resolvedParams.bankId

    // Vérifier que la banque appartient à l'enseignant
    const bank = await db.$queryRaw`
      SELECT * FROM question_banks WHERE id = ${bankId} AND "userId" = ${user.id}
    `

    if (!bank || (bank as any[]).length === 0) {
      return NextResponse.json({ error: 'Banque non trouvée' }, { status: 404 })
    }

    // Supprimer les questions
    await db.$executeRaw`
      DELETE FROM bank_questions WHERE "bankId" = ${bankId}
    `

    // Supprimer la banque
    await db.$executeRaw`
      DELETE FROM question_banks WHERE id = ${bankId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur suppression banque:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}