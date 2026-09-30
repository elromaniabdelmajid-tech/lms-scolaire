import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateBankDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  subject?: string

  @IsString()
  @IsOptional()
  level?: string

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean
}