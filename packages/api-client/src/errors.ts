/**
 * Erreur personnalisée pour les appels API
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly data: any

  constructor(status: number, data: any, message?: string) {
    super(message || `API Error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.data = data

    // Pour que `instanceof ApiError` fonctionne en transpilé ES5
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  /** Statut HTTP */
  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }

  get isServerError(): boolean {
    return this.status >= 500
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }
}