type PlaceholderProps = {
  title: string
}

export function Placeholder({ title }: PlaceholderProps) {
  return (
    <main>
      <h1>{title}</h1>
      <p>GlassCart React shell. Full page markup lands in later phases.</p>
    </main>
  )
}
