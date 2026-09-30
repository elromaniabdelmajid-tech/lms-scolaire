// ============================================================
// Matières scolaires
// Primaire + Collège + Lycée
// ============================================================

// ---- Matières générales ----
export const MATIERES_GENERALES = [
  'Mathématiques',
  'Français',
  'Arabe',
  'Anglais',
  'Sciences',
  'Physique-Chimie',
  'SVT',
  'Histoire-Géographie',
  'Éducation Islamique',
  'Philosophie',
] as const

// ---- Langues ----
export const MATIERES_LANGUES = [
  'Espagnol',
  'Allemand',
  'Italien',
  'Amazigh',
] as const

// ---- Arts & Sport ----
export const MATIERES_ARTS_SPORT = [
  'Arts Plastiques',
  'Musique',
  'Éducation Physique',
  'Sport',
] as const

// ---- Techniques ----
export const MATIERES_TECHNIQUES = [
  'Informatique',
  'Technologie',
] as const

// ---- Économie & Droit ----
export const MATIERES_ECO_DROIT = [
  'Économie',
  'Gestion',
  'Comptabilité',
  'Droit',
] as const

// ============================================================
// Liste complète (plate)
// ============================================================

export const TOUTES_LES_MATIERES = [
  ...MATIERES_GENERALES,
  ...MATIERES_LANGUES,
  ...MATIERES_ARTS_SPORT,
  ...MATIERES_TECHNIQUES,
  ...MATIERES_ECO_DROIT,
] as const

// ============================================================
// Groupes pour <select> avec <optgroup>
// ============================================================

export const MATIERES_GROUPES = [
  { label: 'Matières générales', niveaux: MATIERES_GENERALES },
  { label: 'Langues',            niveaux: MATIERES_LANGUES },
  { label: 'Arts & Sport',       niveaux: MATIERES_ARTS_SPORT },
  { label: 'Techniques',         niveaux: MATIERES_TECHNIQUES },
  { label: 'Économie & Droit',   niveaux: MATIERES_ECO_DROIT },
] as const

// ============================================================
// Alias pour la banque de questions (champ `subject`)
// ============================================================

export const SUBJECTS_GROUPES = MATIERES_GROUPES

// Type utilitaire
export type Matiere = (typeof TOUTES_LES_MATIERES)[number]