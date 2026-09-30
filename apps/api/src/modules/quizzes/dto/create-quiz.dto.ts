import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  timeLimit?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  passingScore?: number

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean

  @IsBoolean()
  @IsOptional()
  shuffleQuestions?: boolean

  @IsBoolean()
  @IsOptional()
  shuffleOptions?: boolean
}