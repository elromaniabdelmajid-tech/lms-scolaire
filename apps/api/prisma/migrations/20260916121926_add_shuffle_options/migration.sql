-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "shuffleOptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false;
