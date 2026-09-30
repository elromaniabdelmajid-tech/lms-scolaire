import { IsNotEmpty, IsString } from 'class-validator'

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty({ message: 'L\'ID du cours est requis' })
  courseId: string
}