import { PartialType } from '@nestjs/mapped-types'
import { CreateBankQuestionDto } from './create-bank-question.dto'

export class UpdateBankQuestionDto extends PartialType(CreateBankQuestionDto) {}