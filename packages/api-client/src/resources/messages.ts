import type { ApiClient } from '../client'

export interface Message {
  id: string
  content: string
  userId: string
  conversationId: string
  isRead: boolean
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SendMessageDto {
  conversationId: string
  content: string
}

export class MessagesResource {
  constructor(private readonly client: ApiClient) {}

  /**
   * Envoyer un message dans une conversation
   */
  async send(dto: SendMessageDto): Promise<Message> {
    return this.client.post<Message>('/messages', dto)
  }
}