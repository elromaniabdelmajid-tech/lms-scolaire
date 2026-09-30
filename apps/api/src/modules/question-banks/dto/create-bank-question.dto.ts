import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateBankQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le texte est requis' })
  text: string

  @IsString()
  @IsOptional()
  type?: string  // 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', etc.

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  points?: number

  @IsString()
  @IsOptional()
  explanation?: string

  @IsArray()
  @IsOptional()
  options?: any[]  // JSON libre (stocké comme Json dans Prisma)

  @IsArray()
  @IsOptional()
  tags?: string[]
}