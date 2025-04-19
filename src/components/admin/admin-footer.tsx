export type AdminFooterProps = {
  copyright: string
}

export function AdminFooter({copyright}: AdminFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-12 border-t py-6 text-center text-sm text-muted-foreground">
      <p>© {year} {copyright}. All rights reserved.</p>
    </footer>
  )
}
