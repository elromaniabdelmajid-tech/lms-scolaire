/**
 * Options pour instancier le client API
 */
export interface ApiClientOptions {
  /** URL de base de l'API NestJS (ex: http://localhost:5000/api) */
  baseUrl: string

  /** Fonction pour récupérer le token Clerk */
  getToken: () => Promise<string | null>

  /** Callback en cas d'erreur 401 (optionnel) */
  onUnauthorized?: () => void

  /** Callback générique en cas d'erreur (optionnel) */
  onError?: (error: any) => void
}

/**
 * Méthodes HTTP supportées
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'