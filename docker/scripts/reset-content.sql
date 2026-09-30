-- ============================================================
-- Reset du contenu LMS (garde les utilisateurs)
-- Usage : psql -U postgres -h localhost -d lms_scolaire -f reset-content.sql
-- ============================================================

TRUNCATE TABLE 
  courses, 
  chapters, 
  quizzes, 
  questions, 
  options, 
  quiz_attempts, 
  answers, 
  resources, 
  progresses, 
  reviews, 
  enrollments, 
  question_banks, 
  bank_questions 
RESTART IDENTITY CASCADE;

SELECT 'Nettoyage terminé' AS status;