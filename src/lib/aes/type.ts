export interface EncryptedPayload {
  iv: string
  authTag: string
  encryptedData: string
}
