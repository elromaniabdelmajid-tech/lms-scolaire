export interface Resource {
  id: string
  title: string
  type: string
  url: string
  createdAt: string
  updatedAt: string
  chapterId: string
}

// ============================================================
// DTOs
// ============================================================

export interface CreateResourceDto {
  title: string
  type: string
  url: string
}

export interface UpdateResourceDto extends Partial<CreateResourceDto> {}