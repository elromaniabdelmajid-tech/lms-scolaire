import { IsInt, IsOptional, Min } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { CreateQuestionDto } from './create-question.dto'
import { Type } from 'class-transformer'

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  position?: number
}