import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface QuizResultData {
  quizTitle: string
  quizDescription: string | null
  courseName: string
  chapterName: string
  totalQuestions: number
  passingScore: number
  attempts: {
    studentName: string
    studentEmail: string
    score: number
    completedAt: Date | null
    passed: boolean
  }[]
  questionStats: {
    text: string
    successRate: number
    correctAnswers: number
    totalAnswers: number
  }[]
}

export function generateQuizResultsPDF(data: QuizResultData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // En-tête
  doc.setFontSize(20)
  doc.setTextColor(79, 70, 229)
  doc.text('EduScolaire', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Résultats du Quiz', pageWidth / 2, 30, { align: 'center' })

  // Informations du quiz
  doc.setFontSize(12)
  doc.text(data.quizTitle, pageWidth / 2, 42, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`${data.courseName} • ${data.chapterName}`, pageWidth / 2, 50, { align: 'center' })

  // Statistiques globales
  const totalAttempts = data.attempts.length
  const averageScore = totalAttempts > 0
    ? Math.round(data.attempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts)
    : 0
  const passedCount = data.attempts.filter(a => a.passed).length
  const successRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0

  doc.setDrawColor(200, 200, 200)
  doc.line(14, 58, pageWidth - 14, 58)

  // Résumé
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(`Tentatives : ${totalAttempts}`, 14, 68)
  doc.text(`Moyenne : ${averageScore}%`, 70, 68)
  doc.text(`Taux de réussite : ${successRate}%`, 120, 68)
  doc.text(`Seuil : ${data.passingScore}%`, 175, 68)

  // Tableau des résultats par élève
  const tableData = data.attempts.map(attempt => [
    attempt.studentName,
    attempt.studentEmail,
    `${attempt.score}%`,
    attempt.passed ? 'Réussi' : 'Échoué',
    attempt.completedAt
      ? new Date(attempt.completedAt).toLocaleDateString('fr-FR')
      : '-'
  ])

  autoTable(doc, {
    startY: 78,
    head: [['Élève', 'Email', 'Score', 'Résultat', 'Date']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 55 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' }
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 3) {
        if (hookData.cell.raw === 'Réussi') {
          hookData.cell.styles.textColor = [22, 163, 74]
          hookData.cell.styles.fontStyle = 'bold'
        } else if (hookData.cell.raw === 'Échoué') {
          hookData.cell.styles.textColor = [220, 38, 38]
          hookData.cell.styles.fontStyle = 'bold'
        }
      }
    }
  })

  // Statistiques par question (page 2 si nécessaire)
  if (data.questionStats.length > 0) {
    doc.addPage()
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Statistiques par question', 14, 20)

    const questionData = data.questionStats.map((q, index) => [
      `#${index + 1}`,
      q.text.length > 60 ? q.text.substring(0, 60) + '...' : q.text,
      `${q.correctAnswers}/${q.totalAnswers}`,
      `${q.successRate}%`
    ])

    autoTable(doc, {
      startY: 30,
      head: [['#', 'Question', 'Réponses', 'Taux']],
      body: questionData,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 110 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' }
      }
    })
  }

  // Pied de page
  const pageCount = (doc as any).getNumberOfPages?.() ?? 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i}/${pageCount} - Généré le ${new Date().toLocaleDateString('fr-FR')} par EduScolaire`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
  }

  return doc
}

export function downloadQuizResults(data: QuizResultData) {
  const doc = generateQuizResultsPDF(data)
  const fileName = `resultats-${data.quizTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`
  doc.save(fileName)
}