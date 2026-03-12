export interface APIResponse<T> {
  code: number
  message: string
  detail: string
  data: T | null
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface QueryParams {
  page?: number
  page_size?: number
  search?: string
}
