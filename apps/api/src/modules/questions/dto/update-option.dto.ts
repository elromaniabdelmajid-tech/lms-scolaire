import { IsInt, IsOptional, Min } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { CreateOptionDto } from './create-option.dto'
import { Type } from 'class-transformer'

export class UpdateOptionDto extends PartialType(CreateOptionDto) {
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  position?: number
}