import { IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est requis' })
  title: string

  @IsString()
  @IsNotEmpty({ message: 'Le type est requis' })
  type: string  // 'PDF', 'VIDEO', 'LINK', etc.

  @IsString()
  @IsNotEmpty({ message: 'L\'URL est requise' })
  url: string
}