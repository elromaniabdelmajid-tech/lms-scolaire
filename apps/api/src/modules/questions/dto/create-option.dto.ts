import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Le texte est requis' })
  text: string

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean
}