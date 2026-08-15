import { apiGet } from '../../../config/api'
import type { ApiResponse } from '../../../shared/interfaces/api-response.interface'
import type { ExampleData, HealthData } from '../interfaces/health.interface'

export class HealthService {
  static getHealth() {
    return apiGet<ApiResponse<HealthData>>('/health')
  }

  static getExample() {
    return apiGet<ApiResponse<ExampleData>>('/example')
  }
}
