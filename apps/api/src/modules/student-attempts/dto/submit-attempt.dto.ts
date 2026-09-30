import { IsNotEmpty, IsObject } from 'class-validator'

export class SubmitAttemptDto {
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string[] | string>
  // Format : { "questionId1": ["optionId1"], "questionId2": ["optA", "optB"], "questionId3": "texte" }
}