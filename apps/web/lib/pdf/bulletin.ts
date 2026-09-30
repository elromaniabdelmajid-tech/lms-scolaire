import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface CourseGrade {
  courseName: string
  average: number
  chaptersCompleted: number
  totalChapters: number
  quizAverage: number
}

interface BulletinData {
  studentName: string
  studentEmail: string
  className: string
  level: string
  schoolYear: string
  courses: CourseGrade[]
  overallAverage: number
  rank?: number
  totalStudents?: number
}

export function generateBulletinPDF(data: BulletinData): jsPDF {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  // En-tête
  doc.setFontSize(20)
  doc.setTextColor(79, 70, 229)
  doc.text('EduScolaire', pageWidth / 2, 20, { align: 'center' })

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Bulletin Scolaire', pageWidth / 2, 30, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Année scolaire ${data.schoolYear}`, pageWidth / 2, 38, { align: 'center' })

  // Informations de l'élève
  doc.setDrawColor(200, 200, 200)
  doc.line(14, 45, pageWidth - 14, 45)

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Informations de l\'élève', 14, 55)

  doc.setFontSize(10)
  doc.text(`Nom : ${data.studentName}`, 14, 63)
  doc.text(`Classe : ${data.className}`, 14, 70)
  doc.text(`Niveau : ${data.level}`, 14, 77)
  doc.text(`Email : ${data.studentEmail}`, 110, 63)

  // Tableau des notes
  const tableData = data.courses.map(course => [
    course.courseName,
    `${course.chaptersCompleted}/${course.totalChapters}`,
    `${course.quizAverage}%`,
    `${course.average}/20`
  ])

  autoTable(doc, {
    startY: 90,
    head: [['Matière', 'Chapitres', 'Quiz', 'Moyenne']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 40, halign: 'center' }
    }
  })

  // Moyenne générale
  const finalY = (doc as any).lastAutoTable.finalY || 150

  doc.setFillColor(240, 240, 255)
  doc.rect(14, finalY + 10, pageWidth - 28, 20, 'F')

  doc.setFontSize(14)
  doc.setTextColor(79, 70, 229)
  doc.text(`Moyenne générale : ${data.overallAverage}/20`, pageWidth / 2, finalY + 22, { align: 'center' })

  // Rang
  if (data.rank && data.totalStudents) {
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(
      `Rang : ${data.rank} sur ${data.totalStudents} élèves`,
      pageWidth / 2,
      finalY + 38,
      { align: 'center' }
    )
  }

  // Pied de page
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(
    `Généré le ${new Date().toLocaleDateString('fr-FR')} par EduScolaire`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  )

  return doc
}

export function downloadBulletin(data: BulletinData) {
  const doc = generateBulletinPDF(data)
  const fileName = `bulletin-${data.studentName.replace(/\s+/g, '-').toLowerCase()}-${data.schoolYear}.pdf`
  doc.save(fileName)
}