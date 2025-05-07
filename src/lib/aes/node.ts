import * as crypto from 'crypto'
import { EncryptedPayload } from '@/lib/aes/type'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

export function generateKey(keyBytesLength = 32): string {
  if (keyBytesLength != 16 && keyBytesLength != 24 && keyBytesLength != 32) {
    throw new Error('key bytes length must be 16,24,32')
  }
  return crypto.randomBytes(keyBytesLength).toString('base64')
}

export function encrypt(text: string, keyB64: string): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH)

  const key = Buffer.from(keyB64, 'base64')
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8')
  encrypted = Buffer.concat([encrypted, cipher.final()])

  const authTag = cipher.getAuthTag()

  return {
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    encryptedData: encrypted.toString('base64'),
  }
}
