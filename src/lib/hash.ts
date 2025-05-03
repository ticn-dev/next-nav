import crypto from 'crypto'

export function sha512(input: string) {
  return crypto.createHash('sha512').update(input).digest('hex')
}
