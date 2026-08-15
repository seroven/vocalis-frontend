export interface ApiResponse<T> {
  status: number
  detail: string
  data: T
}
