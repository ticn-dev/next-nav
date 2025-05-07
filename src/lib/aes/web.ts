import { EncryptedPayload } from '@/lib/aes/type'

function b64ToUint8Array(b64: string) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

export async function decrypt(encryptedPayload: EncryptedPayload, keyBase64: string): Promise<string> {
  if (!window.crypto) {
    throw new Error('Crypto API is not supported in this environment.')
  }

  const key = await window.crypto.subtle.importKey(
    'raw',
    b64ToUint8Array(keyBase64),
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['decrypt'],
  )

  const iv = b64ToUint8Array(encryptedPayload.iv)
  const authTag = b64ToUint8Array(encryptedPayload.authTag)
  const data = b64ToUint8Array(encryptedPayload.encryptedData)

  const dataWithAuthTag = new Uint8Array(data.length + authTag.length)
  dataWithAuthTag.set(data)
  dataWithAuthTag.set(authTag, data.length)

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    dataWithAuthTag,
  )

  return new TextDecoder().decode(decryptedBuffer)
}
