import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  category?: string

  @IsString()
  @IsOptional()
  level?: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean
}