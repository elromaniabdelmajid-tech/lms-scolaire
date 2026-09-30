// ============================================================
// Système scolaire
// Primaire (FR) + Collège/Lycée (marocain avec filières)
// ============================================================

export enum Niveau {
  // ---- Primaire ----
  CP      = 'CP',
  CE1     = 'CE1',
  CE2     = 'CE2',
  CM1     = 'CM1',
  CM2     = 'CM2',
  SIXIEME = '6ème',

  // ---- Collège ----
  AC1 = '1AC',
  AC2 = '2AC',
  AC3 = '3AC',

  // ---- Lycée : Tronc Commun ----
  TCS = 'TCS',
  TCL = 'TCL',

  // ---- Lycée : 1ère Bac ----
  BAC1_SM  = '1BAC SM',
  BAC1_SEX = '1BAC SEX',
  BAC1_L   = '1BAC L',
  BAC1_EC  = '1BAC EC',

  // ---- Lycée : 2ème Bac ----
  BAC2_SM  = '2BAC SM',
  BAC2_PC  = '2BAC PC',
  BAC2_SVT = '2BAC SVT',
  BAC2_L   = '2BAC L',
  BAC2_EC  = '2BAC EC',
}