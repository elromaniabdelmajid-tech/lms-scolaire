-- Supprimer les données existantes
DELETE FROM options;
DELETE FROM questions;
DELETE FROM quizzes;
DELETE FROM chapters;
DELETE FROM courses;
DELETE FROM enrollments;
DELETE FROM users WHERE email IN ('prof@ecole.fr', 'eleve@ecole.fr');

-- Enseignant
INSERT INTO users (id, "clerkId", email, nom, prenom, role, "createdAt", "updatedAt")
VALUES (
  'user_teacher_1',
  'teacher_test_123',
  'prof@ecole.fr',
  'Martin',
  'Sophie',
  'ENSEIGNANT',
  NOW(),
  NOW()
);

-- Élève
INSERT INTO users (id, "clerkId", email, nom, prenom, role, "createdAt", "updatedAt")
VALUES (
  'user_student_1',
  'student_test_123',
  'eleve@ecole.fr',
  'Durand',
  'Lucas',
  'ELEVE',
  NOW(),
  NOW()
);

-- Cours
INSERT INTO courses (id, title, description, category, level, "isPublished", "instructorId", "createdAt", "updatedAt")
VALUES (
  'course_math_1',
  'Introduction à l''algèbre',
  'Apprenez les bases de l''algèbre avec des exercices pratiques',
  'Mathématiques',
  '6ème',
  true,
  'user_teacher_1',
  NOW(),
  NOW()
);

-- Chapitres
INSERT INTO chapters (id, title, description, position, "isPublished", "courseId", "createdAt", "updatedAt")
VALUES 
  ('chapter_math_1_1', 'Les nombres relatifs', 'Découverte des nombres positifs et négatifs', 1, true, 'course_math_1', NOW(), NOW()),
  ('chapter_math_1_2', 'Addition et soustraction', 'Apprendre à additionner et soustraire des nombres relatifs', 2, true, 'course_math_1', NOW(), NOW()),
  ('chapter_math_1_3', 'Multiplication et division', 'Apprendre à multiplier et diviser des nombres relatifs', 3, true, 'course_math_1', NOW(), NOW());

-- Quiz
INSERT INTO quizzes (id, title, description, "timeLimit", "passingScore", "isPublished", "chapterId", "userId", "createdAt", "updatedAt")
VALUES (
  'quiz_math_1_1',
  'Quiz - Les nombres relatifs',
  'Testez vos connaissances sur les nombres relatifs',
  10,
  70,
  true,
  'chapter_math_1_1',
  'user_teacher_1',
  NOW(),
  NOW()
);

-- Questions
INSERT INTO questions (id, text, type, points, position, "quizId", "createdAt", "updatedAt")
VALUES 
  ('q1', 'Quelle est la valeur absolue de -5 ?', 'SINGLE_CHOICE', 1, 1, 'quiz_math_1_1', NOW(), NOW()),
  ('q2', 'Que vaut -3 + 7 ?', 'SINGLE_CHOICE', 1, 2, 'quiz_math_1_1', NOW(), NOW()),
  ('q3', 'Que vaut -4 × 2 ?', 'SINGLE_CHOICE', 1, 3, 'quiz_math_1_1', NOW(), NOW());

-- Options
INSERT INTO options (id, text, "isCorrect", position, "questionId", "createdAt", "updatedAt")
VALUES
  ('o1a', '5', true, 1, 'q1', NOW(), NOW()),
  ('o1b', '-5', false, 2, 'q1', NOW(), NOW()),
  ('o1c', '0', false, 3, 'q1', NOW(), NOW()),
  ('o2a', '4', true, 1, 'q2', NOW(), NOW()),
  ('o2b', '-4', false, 2, 'q2', NOW(), NOW()),
  ('o2c', '10', false, 3, 'q2', NOW(), NOW()),
  ('o3a', '-8', true, 1, 'q3', NOW(), NOW()),
  ('o3b', '8', false, 2, 'q3', NOW(), NOW()),
  ('o3c', '-6', false, 3, 'q3', NOW(), NOW());

-- Inscription
INSERT INTO enrollments (id, "userId", "courseId", progress, "createdAt", "updatedAt")
VALUES (
  'enroll_1',
  (SELECT id FROM users WHERE email = 'eleve@ecole.fr'),
  'course_math_1',
  0,
  NOW(),
  NOW()
);