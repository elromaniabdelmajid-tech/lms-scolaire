import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class ToggleProgressDto {
  @IsString()
  @IsNotEmpty()
  chapterId: string

  @IsString()
  @IsNotEmpty()
  courseId: string

  @IsBoolean()
  isCompleted: boolean
}