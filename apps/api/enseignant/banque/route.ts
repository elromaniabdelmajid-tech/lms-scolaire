import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
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

    const body = await req.json()
    const { name, description, subject, level, isPublic } = body

    if (!name) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 })
    }

    // Utiliser $queryRaw pour créer la banque
    const id = `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await db.$executeRaw`
      INSERT INTO question_banks (id, name, description, subject, level, "isPublic", "userId", "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${description || null}, ${subject || null}, ${level || null}, ${isPublic || false}, ${user.id}, NOW(), NOW())
    `

    return NextResponse.json({ id, name }, { status: 201 })
  } catch (error) {
    console.error('Erreur création banque:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET() {
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

    const banks = await db.$queryRaw`
      SELECT 
        qb.*,
        (SELECT COUNT(*) FROM bank_questions bq WHERE bq."bankId" = qb.id) as question_count
      FROM question_banks qb
      WHERE qb."userId" = ${user.id} OR qb."isPublic" = true
      ORDER BY qb."updatedAt" DESC
    `

    return NextResponse.json(banks)
  } catch (error) {
    console.error('Erreur récupération banques:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}