import path from 'node:path'
import process from 'node:process'
import fs from 'node:fs/promises'

type ResolvablePath = string | string[] | (() => string | string[]) | (() => Promise<string | string[]>)

type FileMetadata = Record<string, unknown>

async function mkParent(target: string) {
  const parentDir = path.dirname(target)
  await fs.mkdir(parentDir, { recursive: true })
}

async function resolvePath(resolvablePath: ResolvablePath): Promise<{ metadataPath: string; filePath: string }> {
  let paths: string[]
  if (typeof resolvablePath === 'function') {
    const resp = resolvablePath()
    let respData: string | string[]
    if (resp instanceof Promise) {
      respData = await resp
    } else {
      respData = resp
    }
    if (Array.isArray(respData)) {
      paths = respData
    } else {
      paths = [respData]
    }
  } else if (Array.isArray(resolvablePath)) {
    paths = resolvablePath
  } else {
    paths = [resolvablePath]
  }

  const metadataPath = path.join(process.cwd(), 'data', 'uploads', 'metadata', ...paths)
  const filePath = path.join(process.cwd(), 'data', 'uploads', 'file', ...paths)

  await mkParent(metadataPath)
  await mkParent(filePath)

  return { metadataPath, filePath }
}

export async function saveData(targetPath: ResolvablePath, data: Uint8Array, metadata?: FileMetadata) {
  const { metadataPath, filePath } = await resolvePath(targetPath)

  await fs.writeFile(filePath, data)
  await fs.writeFile(metadataPath, JSON.stringify(metadata), { encoding: 'utf-8' })
}

export async function deleteData(targetPath: ResolvablePath) {
  const { metadataPath, filePath } = await resolvePath(targetPath)
  try {
    await fs.rm(metadataPath, { recursive: true })
    await fs.rm(filePath, { recursive: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

export async function readData(targetPath: ResolvablePath) {
  const { metadataPath, filePath } = await resolvePath(targetPath)
  try {
    const fileExist = await isFileExist(metadataPath)
    if (!fileExist) {
      return null
    }
    const data = await fs.readFile(filePath)
    const metadataStr = await fs.readFile(metadataPath, { encoding: 'utf-8' })
    const metadata = JSON.parse(metadataStr)
    return { data, metadata }
  } catch (error) {
    console.error('Error reading file:', error)
    throw error
  }
}

async function isFileExist(targetPath: string) {
  try {
    const stat = await fs.stat(targetPath)
    return stat.isFile()
  } catch {
    return false
  }
}
