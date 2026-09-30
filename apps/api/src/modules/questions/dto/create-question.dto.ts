import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le texte est requis' })
  text: string

  @IsString()
  @IsNotEmpty({ message: 'Le type est requis' })
  type: string  // 'QCM', 'VRAI_FAUX', 'REPONSE_LIBRE', etc.

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  points?: number

  @IsString()
  @IsOptional()
  explanation?: string

  @IsString()
  @IsOptional()
  svg?: string
}