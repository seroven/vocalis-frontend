import { useEffect, useState } from 'react'
import type { ExampleData, HealthData } from './interfaces/health.interface'
import { HealthService } from './services/HealthService'

export function HealthPage() {
  const [example, setExample] = useState<ExampleData | null>(null)
  const [health, setHealth] = useState<HealthData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([HealthService.getExample(), HealthService.getHealth()])
      .then(([exampleResponse, healthResponse]) => {
        setExample(exampleResponse.data)
        setHealth(healthResponse.data)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'No se pudo conectar con la API')
      })
  }, [])

  return (
    <section className="page">
      <h1>Vocalis</h1>
      <p className="lead">Entrenador vocal. Esta página solo comprueba que front y back ya se hablan.</p>

      {error && <p className="error">{error}</p>}

      {example && (
        <article className="card">
          <h2>Ejemplo de API</h2>
          <p>{example.tip}</p>
          <ul>
            {example.exercises.map((exercise) => (
              <li key={exercise}>{exercise}</li>
            ))}
          </ul>
        </article>
      )}

      {health && (
        <article className="card">
          <h2>Estado del servidor</h2>
          <p>Servicio: {health.service}</p>
          <p>
            MySQL:{' '}
            {health.database.connected
              ? health.database.message
              : `aún no conectado (${health.database.message})`}
          </p>
        </article>
      )}
    </section>
  )
}
