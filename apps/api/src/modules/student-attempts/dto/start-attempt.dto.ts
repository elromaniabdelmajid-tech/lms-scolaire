import { IsNotEmpty, IsString } from 'class-validator'

export class StartAttemptDto {
  @IsString()
  @IsNotEmpty()
  quizId: string
}