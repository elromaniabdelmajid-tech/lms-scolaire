import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsBoolean()
  @IsOptional()
  isFree?: boolean

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean
}