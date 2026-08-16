import { useAuth } from '../auth/AuthContext'

const upcoming = [
  {
    title: 'Calentamiento',
    text: 'Sirenas, lip trills y escalas para abrir la voz sin forzar.',
  },
  {
    title: 'Oído',
    text: 'Afinación y intervalos, con feedback en el momento.',
  },
  {
    title: 'Canciones',
    text: 'Practica sobre temas de tu Spotify, a tu tono.',
  },
]

export function HomePage() {
  const { user } = useAuth()

  return (
    <section className="w-full">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm tracking-[0.22em] text-accent uppercase">Tu espacio</p>
        <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-stage-fg md:text-6xl">
          Hola{user?.displayName ? `, ${user.displayName}` : ''}
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-relaxed text-stage-muted">
          Ya estás dentro de <span className="font-semibold text-accent">Vocalis</span>.
          Aquí va a vivir el entrenador: poco a poco, sin prisa, con ganas de volver.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {upcoming.map((item) => (
          <article key={item.title}>
            <h2 className="font-display text-2xl tracking-tight text-stage-fg">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-stage-muted">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
