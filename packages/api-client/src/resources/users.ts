import type { ApiClient } from '../client'

export class UsersResource {
  constructor(private readonly client: ApiClient) {}

  async getMe(): Promise<any> {
    return this.client.get('/users/me')
  }
}