import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string
}