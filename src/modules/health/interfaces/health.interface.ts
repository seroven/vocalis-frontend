export interface HealthData {
  service: string
  uptime: number
  database: {
    connected: boolean
    message: string
  }
}

export interface ExampleData {
  app: string
  tip: string
  exercises: string[]
}
