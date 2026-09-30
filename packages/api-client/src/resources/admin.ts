import type { ApiClient } from '../client'

export class AdminResource {
  constructor(private readonly client: ApiClient) {}

  async getDashboard(): Promise<any> {
    return this.client.get('/admin/dashboard')
  }
}