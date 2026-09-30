import { Niveau } from '../types/user'


// ============================================================
// Listes par cycle
// ============================================================

export const NIVEAUX_PRIMAIRE = [
  Niveau.CP,
  Niveau.CE1,
  Niveau.CE2,
  Niveau.CM1,
  Niveau.CM2,
  Niveau.SIXIEME,
] as const

export const NIVEAUX_COLLEGE = [
  Niveau.AC1,
  Niveau.AC2,
  Niveau.AC3,
] as const

// ---- Lycée par sous-niveau ----
export const NIVEAUX_LYCEE_TC = [
  Niveau.TCS,
  Niveau.TCL,
] as const

export const NIVEAUX_LYCEE_1BAC = [
  Niveau.BAC1_SM,
  Niveau.BAC1_SEX,
  Niveau.BAC1_L,
  Niveau.BAC1_EC,
] as const

export const NIVEAUX_LYCEE_2BAC = [
  Niveau.BAC2_SM,
  Niveau.BAC2_PC,
  Niveau.BAC2_SVT,
  Niveau.BAC2_L,
  Niveau.BAC2_EC,
] as const

export const NIVEAUX_LYCEE = [
  ...NIVEAUX_LYCEE_TC,
  ...NIVEAUX_LYCEE_1BAC,
  ...NIVEAUX_LYCEE_2BAC,
] as const

// ============================================================
// Liste complète (plate)
// ============================================================

export const TOUS_LES_NIVEAUX = [
  ...NIVEAUX_PRIMAIRE,
  ...NIVEAUX_COLLEGE,
  ...NIVEAUX_LYCEE,
] as const

// ============================================================
// Groupes pour <select> avec <optgroup> — OPTION B
// ============================================================

export const NIVEAUX_GROUPES = [
  { label: 'Primaire',              niveaux: NIVEAUX_PRIMAIRE },
  { label: 'Collège',               niveaux: NIVEAUX_COLLEGE },
  { label: 'Lycée — Tronc Commun',  niveaux: NIVEAUX_LYCEE_TC },
  { label: 'Lycée — 1ère Bac',      niveaux: NIVEAUX_LYCEE_1BAC },
  { label: 'Lycée — 2ème Bac',      niveaux: NIVEAUX_LYCEE_2BAC },
] as const