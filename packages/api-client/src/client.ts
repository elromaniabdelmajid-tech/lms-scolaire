import { ApiError } from './errors'
import { ApiClientOptions, HttpMethod } from './types'
import { CoursesResource } from './resources/courses'
import { ChaptersResource } from './resources/chapters'
import { ResourcesResource } from './resources/resources'
import { QuizzesResource } from './resources/quizzes'
import { QuestionsResource } from './resources/questions'
import { BanksResource } from './resources/banks'
import { AttemptsResource } from './resources/attempts'
import { EnrollmentsResource } from './resources/enrollments'
import { NotificationsResource } from './resources/notifications'
import { ProgressResource } from './resources/progress'
import { MessagesResource } from './resources/messages'
import { StudentResource } from './resources/student'
import { ParentResource } from './resources/parent'
import { AdminResource } from './resources/admin'
import { UsersResource } from './resources/users'


/**
 * Client HTTP typé pour communiquer avec l'API NestJS
 */
export class ApiClient {
  private readonly baseUrl: string
  private readonly getToken: () => Promise<string | null>
  private readonly onUnauthorized?: () => void
  private readonly onError?: (error: any) => void

  // Ressources
  public readonly courses: CoursesResource
  public readonly chapters: ChaptersResource
  public readonly resources: ResourcesResource
  public readonly quizzes: QuizzesResource
  public readonly questions: QuestionsResource
  public readonly banks: BanksResource
  public readonly attempts: AttemptsResource
  public readonly enrollments: EnrollmentsResource
  public readonly notifications: NotificationsResource
  public readonly progress: ProgressResource
  public readonly messages: MessagesResource
  public readonly student: StudentResource
  public readonly parent: ParentResource
  public readonly admin: AdminResource
  public readonly users: UsersResource
  

  constructor(options: ApiClientOptions) {
    // Retire le slash final si présent
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.getToken = options.getToken
    this.onUnauthorized = options.onUnauthorized
    this.onError = options.onError
	this.messages = new MessagesResource(this)

    // Instancier les ressources
    this.courses = new CoursesResource(this)
    this.chapters = new ChaptersResource(this)
    this.resources = new ResourcesResource(this)
    this.quizzes = new QuizzesResource(this)
    this.questions = new QuestionsResource(this)
    this.banks = new BanksResource(this)
    this.attempts = new AttemptsResource(this)
    this.enrollments = new EnrollmentsResource(this)
    this.notifications = new NotificationsResource(this)
    this.progress = new ProgressResource(this)
	this.student = new StudentResource(this)
	this.parent = new ParentResource(this)
	this.admin = new AdminResource(this)
	this.users = new UsersResource(this)

  }

  /**
   * Effectue une requête HTTP vers l'API
   */
  async request<T = any>(
    method: HttpMethod,
    path: string,
    body?: any,
    options?: { signal?: AbortSignal },
  ): Promise<T> {
    const token = await this.getToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    let response: Response

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal,
      })
    } catch (networkError) {
      // Erreur réseau (pas de connexion, timeout, etc.)
      this.onError?.(networkError)
      throw new ApiError(0, { message: 'Erreur réseau' }, 'Erreur réseau')
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    // Parser le JSON
    let data: any
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      data = await response.json()
    } else if (contentType.includes('text/')) {
      data = await response.text()
    } else {
      data = await response.blob()
    }

    // Gérer les erreurs HTTP
    if (!response.ok) {
      // Callback 401
      if (response.status === 401) {
        this.onUnauthorized?.()
      }

      const error = new ApiError(
        response.status,
        data,
        data?.message || data?.error || `Erreur ${response.status}`,
      )

      this.onError?.(error)
      throw error
    }

    return data as T
  }

  // Raccourcis HTTP
  get<T = any>(path: string, options?: { signal?: AbortSignal }) {
    return this.request<T>('GET', path, undefined, options)
  }

  post<T = any>(path: string, body?: any, options?: { signal?: AbortSignal }) {
    return this.request<T>('POST', path, body, options)
  }

  put<T = any>(path: string, body?: any, options?: { signal?: AbortSignal }) {
    return this.request<T>('PUT', path, body, options)
  }

  patch<T = any>(path: string, body?: any, options?: { signal?: AbortSignal }) {
    return this.request<T>('PATCH', path, body, options)
  }

  delete<T = any>(path: string, options?: { signal?: AbortSignal }) {
    return this.request<T>('DELETE', path, undefined, options)
  }
}