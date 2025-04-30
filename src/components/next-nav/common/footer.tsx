export type FooterProps = {
  copyright: string
}

export function Footer({ copyright }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="text-muted-foreground bg-accent z-10 border-t py-2 text-center text-sm">
      <p>
        © {year} {copyright}. All rights reserved.
      </p>
    </footer>
  )
}
