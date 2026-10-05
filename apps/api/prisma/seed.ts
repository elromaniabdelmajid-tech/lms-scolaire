import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed...')

  // ============================================================
  // 1. UTILISATEURS
  // ============================================================
  console.log('👥 Création des utilisateurs...')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecole.fr' },
    update: {},
    create: {
      clerkId: 'user_3HM1KuVnEPCKwP13l5PdtAa3Uf9',
      email: 'admin@ecole.fr',
      nom: 'Admin',
      prenom: 'Super',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin créé:', admin.email)

  const prof = await prisma.user.upsert({
    where: { email: 'prof@ecole.fr' },
    update: {},
    create: {
      clerkId: 'user_3HMJC0MX237M6SII8qPRyPIQEGm',
      email: 'prof@ecole.fr',
      nom: 'Durand',
      prenom: 'Marie',
      role: 'ENSEIGNANT',
    },
  })
  console.log('✅ Prof créé:', prof.email)

  const parent = await prisma.user.upsert({
    where: { email: 'parent@ecole.fr' },
    update: {},
    create: {
      clerkId: 'user_3HmZJ0UmoGj2b76BBq75JCGRC9J',
      email: 'parent@ecole.fr',
      nom: 'Durand',
      prenom: 'Pierre',
      role: 'PARENT',
    },
  })
  console.log('✅ Parent créé:', parent.email)

  const eleve = await prisma.user.upsert({
    where: { email: 'eleve@ecole.fr' },
    update: { parentId: parent.id },
    create: {
      clerkId: 'user_3HMJJ4PrkqrQPQwGeGR8BQREikm',
      email: 'eleve@ecole.fr',
      nom: 'Durand',
      prenom: 'Lucas',
      role: 'ELEVE',
      parentId: parent.id,
    },
  })
  console.log('✅ Élève créé:', eleve.email, '(parent:', parent.email + ')')

  // ============================================================
  // 2. COURS
  // ============================================================
  console.log('\n📚 Création des cours...')

  const coursMaths = await prisma.course.create({
    data: {
      title: 'Mathématiques - Niveau 1',
      description: 'Cours de mathématiques pour débutants',
      category: 'Mathématiques',
      level: 'TCS',
      isPublished: true,
      instructorId: prof.id,
    },
  })
  console.log('✅ Cours créé:', coursMaths.title)

  const coursFrancais = await prisma.course.create({
    data: {
      title: 'Français - Niveau 1',
      description: 'Cours de français pour débutants',
      category: 'Français',
      level: 'TCS',
      isPublished: true,
      instructorId: prof.id,
    },
  })
  console.log('✅ Cours créé:', coursFrancais.title)

  // ============================================================
  // 3. CHAPITRES
  // ============================================================
  console.log('\n📖 Création des chapitres...')

  const chapitreMaths1 = await prisma.chapter.create({
    data: {
      title: 'Les nombres entiers',
      description: 'Introduction aux nombres entiers',
      position: 1,
      isPublished: true,
      isFree: true,
      courseId: coursMaths.id,
    },
  })

  const chapitreMaths2 = await prisma.chapter.create({
    data: {
      title: 'Les fractions',
      description: 'Introduction aux fractions',
      position: 2,
      isPublished: true,
      isFree: false,
      courseId: coursMaths.id,
    },
  })

  const chapitreFrancais1 = await prisma.chapter.create({
    data: {
      title: 'Grammaire de base',
      description: 'Les règles de grammaire essentielles',
      position: 1,
      isPublished: true,
      isFree: true,
      courseId: coursFrancais.id,
    },
  })
  console.log('✅ 3 chapitres créés')

  // ============================================================
  // 4. RESSOURCES
  // ============================================================
  console.log('\n📎 Création des ressources...')

  await prisma.resource.createMany({
    data: [
      {
        title: 'Introduction aux nombres entiers',
        type: 'PDF',
        url: 'https://exemple.com/nombres-entiers.pdf',
        chapterId: chapitreMaths1.id,
      },
      {
        title: 'Vidéo - Les fractions',
        type: 'VIDEO',
        url: 'https://exemple.com/fractions.mp4',
        chapterId: chapitreMaths2.id,
      },
    ],
  })
  console.log('✅ 2 ressources créées')

  // ============================================================
  // 5. QUIZ
  // ============================================================
  console.log('\n📝 Création des quiz...')

  const quizMaths = await prisma.quiz.create({
    data: {
      title: 'Quiz - Les nombres entiers',
      description: 'Testez vos connaissances sur les nombres entiers',
      timeLimit: 10,
      passingScore: 70,
      isPublished: true,
      chapterId: chapitreMaths1.id,
      userId: prof.id,
    },
  })
  console.log('✅ Quiz créé:', quizMaths.title)

  // ============================================================
  // 6. QUESTIONS + OPTIONS
  // ============================================================
  console.log('\n❓ Création des questions...')

  const questionsData = [
    {
      text: 'Quel est le plus petit nombre entier positif ?',
      type: 'SINGLE_CHOICE',
      points: 1,
      position: 1,
      explanation: 'Le plus petit nombre entier positif est 1.',
      options: [
        { text: '0', isCorrect: false, position: 1 },
        { text: '1', isCorrect: true, position: 2 },
        { text: '-1', isCorrect: false, position: 3 },
      ],
    },
    {
      text: 'La somme de deux nombres entiers est toujours un entier.',
      type: 'TRUE_FALSE',
      points: 1,
      position: 2,
      explanation: 'Vrai. La somme de deux entiers est un entier.',
      options: [
        { text: 'Vrai', isCorrect: true, position: 1 },
        { text: 'Faux', isCorrect: false, position: 2 },
      ],
    },
    {
      text: 'Quel nombre est pair parmi les suivants ?',
      type: 'MULTIPLE_CHOICE',
      points: 2,
      position: 3,
      explanation: '2, 4 et 8 sont pairs.',
      options: [
        { text: '2', isCorrect: true, position: 1 },
        { text: '3', isCorrect: false, position: 2 },
        { text: '4', isCorrect: true, position: 3 },
        { text: '8', isCorrect: true, position: 4 },
      ],
    },
  ]

  for (const q of questionsData) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        type: q.type,
        points: q.points,
        position: q.position,
        explanation: q.explanation,
        quizId: quizMaths.id,
      },
    })

    await prisma.option.createMany({
      data: q.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        position: o.position,
        questionId: question.id,
      })),
    })
  }
  console.log(`✅ ${questionsData.length} questions créées`)

  // ============================================================
  // 7. INSCRIPTIONS
  // ============================================================
  console.log('\n🎓 Création des inscriptions...')

  await prisma.enrollment.create({
    data: {
      userId: eleve.id,
      courseId: coursMaths.id,
      progress: 50,
    },
  })

  await prisma.enrollment.create({
    data: {
      userId: eleve.id,
      courseId: coursFrancais.id,
      progress: 25,
    },
  })
  console.log('✅ 2 inscriptions créées')

  // ============================================================
  // 8. BANQUE DE QUESTIONS
  // ============================================================
  console.log('\n🏦 Création d\'une banque...')

  const banque = await prisma.questionBank.create({
    data: {
      name: 'Banque de Maths - Base',
      description: 'Questions de mathématiques niveau base',
      subject: 'Mathématiques',
      level: 'TCS',
      isPublic: true,
      userId: prof.id,
    },
  })

  await prisma.bankQuestion.create({
    data: {
      text: 'Combien font 2 + 2 ?',
      type: 'SINGLE_CHOICE',
      points: 1,
      options: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false },
      ],
      tags: ['addition', 'base'],
      bankId: banque.id,
    },
  })
  console.log('✅ Banque créée avec 1 question')

  // ============================================================
  // 9. XP & BADGES
  // ============================================================
  console.log('\n🏆 Création XP et badges...')

  await prisma.xP.create({
    data: {
      userId: eleve.id,
      points: 250,
      level: 3,
    },
  })

  const badges = await prisma.badge.createMany({
    data: [
      {
        name: 'Premier pas',
        description: 'Terminer son premier chapitre',
        icon: '🌱',
        category: 'PROGRESS',
        condition: 'complete_first_chapter',
        pointsRequired: 10,
      },
      {
        name: 'Studieux',
        description: 'Atteindre 100 XP',
        icon: '📚',
        category: 'XP',
        condition: 'reach_100_xp',
        pointsRequired: 100,
      },
      {
        name: 'Expert',
        description: 'Atteindre 500 XP',
        icon: '🏆',
        category: 'XP',
        condition: 'reach_500_xp',
        pointsRequired: 500,
      },
    ],
  })

  // Attribuer 1 badge à l'élève
  const badge1 = await prisma.badge.findFirst({
    where: { name: 'Premier pas' },
  })

  if (badge1) {
    await prisma.userBadge.create({
      data: {
        userId: eleve.id,
        badgeId: badge1.id,
      },
    })
  }
  console.log('✅ XP + 3 badges créés')

  // ============================================================
  // RÉCAPITULATIF
  // ============================================================
  console.log('\n' + '='.repeat(50))
  console.log('🎉 SEED TERMINÉ AVEC SUCCÈS !')
  console.log('='.repeat(50))
  console.log('\n📊 Données créées :')
  console.log('  👥 4 utilisateurs')
  console.log('  📚 2 cours')
  console.log('  📖 3 chapitres')
  console.log('  📎 2 ressources')
  console.log('  📝 1 quiz + 3 questions')
  console.log('  🎓 2 inscriptions')
  console.log('  🏦 1 banque + 1 question')
  console.log('  🏆 250 XP + 3 badges')
  console.log('\n🔑 Comptes de test :')
  console.log('  admin@ecole.fr    (ADMIN)')
  console.log('  prof@ecole.fr     (ENSEIGNANT)')
  console.log('  eleve@ecole.fr    (ELEVE)')
  console.log('  parent@ecole.fr   (PARENT)')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })