export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  score: number | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AttemptQuestion {
  id: string
  text: string
  type: string
  points: number
  explanation: string | null
  svg: string | null
  options: AttemptOption[]
}

export interface AttemptOption {
  id: string
  text: string
}

export interface AttemptQuestionsData {
  attemptId: string
  title: string
  questions: AttemptQuestion[]
}

export interface CheckAnswerResult {
  isCorrect: boolean
  explanation: string | null
  correctOptionIds: string[]
}

export interface SubmitResult {
  success: boolean
  score: number
  totalPoints: number
  earnedPoints: number
}

export interface QuestionResult {
  id: string
  text: string
  type: string
  isCorrect: boolean | null
  points: number
  earnedPoints: number
  userAnswer: string | null
  correctAnswer: string
}

export interface AttemptResults {
  attemptId: string
  score: number | null
  totalPoints: number
  earnedPoints: number
  completedAt: string
  questions: QuestionResult[]
}

export interface CheckAnswerDto {
  questionId: string
  selectedOptionIds: string[]
}

export interface SubmitAttemptDto {
  answers: Record<string, string[] | string>
}