// apps/web/lib/db.ts
import { PrismaClient } from '@prisma/client'

// Déclaration globale pour éviter les multiples instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Créer une instance unique
export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Vérification des modèles disponibles
//console.log('Modèles Prisma disponibles:', Object.keys(db).filter(key => !key.startsWith('_')))