import { BackButton } from '../../shared/components/BackButton'

export function RecordingsPage() {
  return (
    <section className="w-full text-center">
      <div className="text-left">
        <BackButton />
      </div>
      <h1 className="font-display text-5xl tracking-tight text-stage-fg md:text-6xl">
        Mis grabaciones
      </h1>
    </section>
  )
}
