import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'

class OptionDto {
  @IsString()
  @IsNotEmpty()
  text: string

  @IsBoolean()
  isCorrect: boolean
}

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string

  @IsString()
  type: string

  @IsInt()
  @Min(1)
  points: number

  @IsString()
  @IsOptional()
  svg?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[]
}

export class ImportCsvDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[]
}