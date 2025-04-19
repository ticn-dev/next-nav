import {toast as _toast} from 'sonner'

export function toast(options: {
  title: string,
  description?: string,
  variant?: "destructive",
}): string | number {
  if (options.variant === 'destructive') {
    return _toast.error(options.title, {description: options.description, position: 'top-center'})
  } else {
    return _toast(options.title, {description: options.description, position: 'top-center'})
  }
}