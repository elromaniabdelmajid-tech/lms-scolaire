SET client_encoding TO 'UTF8';

DELETE FROM options;

INSERT INTO options (id, text, "isCorrect", position, "questionId", "createdAt", "updatedAt")
VALUES 
  ('opt_fct_1_1_a', 'Une relation qui associe à chaque élément de départ un unique élément d''arrivée', true, 1, 'q_fct_1_1', NOW(), NOW()),
  ('opt_fct_1_1_b', 'Une relation qui associe plusieurs éléments d''arrivée à chaque élément de départ', false, 2, 'q_fct_1_1', NOW(), NOW()),
  ('opt_fct_1_1_c', 'Un nombre qui varie', false, 3, 'q_fct_1_1', NOW(), NOW()),
  ('opt_fct_1_1_d', 'Une équation à résoudre', false, 4, 'q_fct_1_1', NOW(), NOW()),
  
  ('opt_fct_1_2_a', 'f(x)', true, 1, 'q_fct_1_2', NOW(), NOW()),
  ('opt_fct_1_2_b', 'x(f)', false, 2, 'q_fct_1_2', NOW(), NOW()),
  ('opt_fct_1_2_c', 'f + x', false, 3, 'q_fct_1_2', NOW(), NOW()),
  ('opt_fct_1_2_d', 'f × x', false, 4, 'q_fct_1_2', NOW(), NOW()),
  
  ('opt_fct_1_3_a', 'Une seule image', true, 1, 'q_fct_1_3', NOW(), NOW()),
  ('opt_fct_1_3_b', 'Deux images', false, 2, 'q_fct_1_3', NOW(), NOW()),
  ('opt_fct_1_3_c', 'Aucune image', false, 3, 'q_fct_1_3', NOW(), NOW()),
  ('opt_fct_1_3_d', 'Une infinité d''images', false, 4, 'q_fct_1_3', NOW(), NOW()),

  ('opt_fct_2_1_a', 'L''axe horizontal', true, 1, 'q_fct_2_1', NOW(), NOW()),
  ('opt_fct_2_1_b', 'L''axe vertical', false, 2, 'q_fct_2_1', NOW(), NOW()),
  ('opt_fct_2_1_c', 'L''origine du repère', false, 3, 'q_fct_2_1', NOW(), NOW()),
  ('opt_fct_2_1_d', 'La courbe de la fonction', false, 4, 'q_fct_2_1', NOW(), NOW()),
  
  ('opt_fct_2_2_a', '\( y = 2x + 1 \)', true, 1, 'q_fct_2_2', NOW(), NOW()),
  ('opt_fct_2_2_b', '\( y = x + 2 \)', false, 2, 'q_fct_2_2', NOW(), NOW()),
  ('opt_fct_2_2_c', '\( y = 2x \)', false, 3, 'q_fct_2_2', NOW(), NOW()),
  ('opt_fct_2_2_d', '\( y = x^2 + 1 \)', false, 4, 'q_fct_2_2', NOW(), NOW()),
  
  ('opt_fct_2_3_a', '9', true, 1, 'q_fct_2_3', NOW(), NOW()),
  ('opt_fct_2_3_b', '6', false, 2, 'q_fct_2_3', NOW(), NOW()),
  ('opt_fct_2_3_c', '3', false, 3, 'q_fct_2_3', NOW(), NOW()),
  ('opt_fct_2_3_d', '12', false, 4, 'q_fct_2_3', NOW(), NOW()),

  ('opt_fct_3_1_a', '\( f(x) = ax + b \)', true, 1, 'q_fct_3_1', NOW(), NOW()),
  ('opt_fct_3_1_b', '\( f(x) = ax^2 + b \)', false, 2, 'q_fct_3_1', NOW(), NOW()),
  ('opt_fct_3_1_c', '\( f(x) = a/x \)', false, 3, 'q_fct_3_1', NOW(), NOW()),
  ('opt_fct_3_1_d', '\( f(x) = a \)', false, 4, 'q_fct_3_1', NOW(), NOW()),
  
  ('opt_fct_3_2_a', '3', true, 1, 'q_fct_3_2', NOW(), NOW()),
  ('opt_fct_3_2_b', '-2', false, 2, 'q_fct_3_2', NOW(), NOW()),
  ('opt_fct_3_2_c', '2', false, 3, 'q_fct_3_2', NOW(), NOW()),
  ('opt_fct_3_2_d', '1', false, 4, 'q_fct_3_2', NOW(), NOW()),
  
  ('opt_fct_3_3_a', '5', true, 1, 'q_fct_3_3', NOW(), NOW()),
  ('opt_fct_3_3_b', '-2', false, 2, 'q_fct_3_3', NOW(), NOW()),
  ('opt_fct_3_3_c', '2', false, 3, 'q_fct_3_3', NOW(), NOW()),
  ('opt_fct_3_3_d', '-5', false, 4, 'q_fct_3_3', NOW(), NOW()),
  
  ('opt_fct_3_4_a', 'b = 0', true, 1, 'q_fct_3_4', NOW(), NOW()),
  ('opt_fct_3_4_b', 'a = 0', false, 2, 'q_fct_3_4', NOW(), NOW()),
  ('opt_fct_3_4_c', 'a = 1', false, 3, 'q_fct_3_4', NOW(), NOW()),
  ('opt_fct_3_4_d', 'b = 1', false, 4, 'q_fct_3_4', NOW(), NOW());