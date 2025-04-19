export type AdminFooterProps = {
  copyright: string
}

export function AdminFooter({ copyright }: AdminFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="text-muted-foreground mt-12 border-t py-6 text-center text-sm">
      <p>
        © {year} {copyright}. All rights reserved.
      </p>
    </footer>
  )
}
