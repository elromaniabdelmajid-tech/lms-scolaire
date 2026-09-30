import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class CheckAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string

  @IsArray()
  selectedOptionIds: string[]   // tableau d'IDs (pour supporter MULTIPLE_CHOICE)
}