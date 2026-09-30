import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { CreateChapterDto } from './create-chapter.dto'

export class UpdateChapterDto extends PartialType(CreateChapterDto) {
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number
}