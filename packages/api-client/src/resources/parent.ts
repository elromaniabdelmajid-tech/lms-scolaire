import type { ApiClient } from '../client'

export class ParentResource {
  constructor(private readonly client: ApiClient) {}

  async getDashboard(): Promise<any> {
    return this.client.get('/parent/dashboard')
  }
  
    async getChild(childId: string): Promise<any> {
    return this.client.get(`/parent/children/${childId}`)
  }
}