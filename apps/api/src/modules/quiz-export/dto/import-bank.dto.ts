import { IsArray, IsNotEmpty, IsString } from 'class-validator'

export class ImportBankDto {
  @IsString()
  @IsNotEmpty({ message: 'L\'ID de la banque est requis' })
  bankId: string

  @IsArray()
  @IsNotEmpty({ message: 'Au moins une question est requise' })
  questionIds: string[]
}