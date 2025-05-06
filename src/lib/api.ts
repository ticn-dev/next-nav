import { Site, SiteWithCategory } from '@/types/site'
import { Category, CategoryWithSiteIds } from '@/types/category'
import { MetaData } from '@/types/metadata'
import { SystemSettings } from '@/lib/settings'
import { BackupRestoreOptions } from '@/lib/backup-restore'
import { Bookmarks } from '@/lib/bookmarks-parser'
import { SystemSettingsRecord } from '@/types/settings'

export async function getSites() {
  const response = await fetch('/api/admin/sites')
  if (response.ok) {
    const data = await response.json()
    return data as SiteWithCategory[]
  } else {
    throw new Error(`Failed to fetch sites: ${response.statusText}`)
  }
}

export async function getCategories() {
  const response = await fetch('/api/admin/categories')
  if (response.ok) {
    const data = await response.json()
    return data as CategoryWithSiteIds[]
  } else {
    throw new Error(`Failed to fetch categories: ${response.statusText}`)
  }
}

export async function deleteSites(id: number): Promise<void>
export async function deleteSites(ids: number[]): Promise<void>
export async function deleteSites(idOrIdArray: number | number[]): Promise<void>
export async function deleteSites(idOrIdArray: number | number[]): Promise<void> {
  const ids = Array.isArray(idOrIdArray) ? idOrIdArray : [idOrIdArray]
  if (ids.length === 0) return
  const response = await fetch('/api/admin/sites', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ids),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete sites: ${response.statusText}`)
  }
}

export async function deleteCategories(id: number): Promise<void>
export async function deleteCategories(ids: number[]): Promise<void>
export async function deleteCategories(idOrIdArray: number | number[]): Promise<void>
export async function deleteCategories(idOrIdArray: number | number[]): Promise<void> {
  const ids = Array.isArray(idOrIdArray) ? idOrIdArray : [idOrIdArray]
  if (ids.length === 0) return
  const response = await fetch('/api/admin/categories', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ids),
  })
  if (!response.ok) {
    throw new Error(`Failed to delete categories: ${response.statusText}`)
  }
}

export async function newSite(option: Omit<Site, 'id'>, imageFile?: File) {
  const formData = new FormData()
  formData.append('request', JSON.stringify(option))
  if (option.imageMode === 'upload' && imageFile) {
    formData.append('imageData', imageFile)
  }
  const newSiteResponse = await fetch('/api/admin/sites', {
    method: 'PUT',
    body: formData,
  })
  if (newSiteResponse.ok) {
    const newSite = await newSiteResponse.json()
    return newSite as Site
  } else {
    throw new Error(`Failed to create new site: ${newSiteResponse.statusText}`)
  }
}

export async function newCategory(option: Omit<Category, 'id'>) {
  const newCategoryResponse = await fetch('/api/admin/categories', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(option),
  })
  if (newCategoryResponse.ok) {
    const newCategory = await newCategoryResponse.json()
    return newCategory as Category
  } else {
    throw new Error(`Failed to create new category: ${newCategoryResponse.statusText}`)
  }
}

export async function updateSites(id: number, option: Omit<Site, 'id'>, imageFile?: File): Promise<Site[]>
export async function updateSites(ids: number[], option: Omit<Site, 'id'>, imageFile?: File): Promise<Site[]>
export async function updateSites(idOrIdArray: number | number[], option: Omit<Site, 'id'>, imageFile?: File): Promise<Site[]>
export async function updateSites(idOrIdArray: number | number[], option: Omit<Site, 'id'>, imageFile?: File): Promise<Site[]> {
  const ids = Array.isArray(idOrIdArray) ? idOrIdArray : [idOrIdArray]
  if (ids.length === 0) return []
  const formData = new FormData()
  formData.append('request', JSON.stringify(option))
  formData.append('ids', JSON.stringify(ids))
  if (option.imageMode === 'upload' && imageFile) {
    formData.append('imageData', imageFile)
  }
  const response = await fetch(`/api/admin/sites`, {
    method: 'PATCH',
    body: formData,
  })
  if (!response.ok) {
    throw new Error(`Failed to update sites: ${response.statusText}`)
  }
  const updatedSites = await response.json()
  return updatedSites as Site[]
}

export async function updateSitesCategory(id: number, categoryId: number): Promise<Site[]>
export async function updateSitesCategory(ids: number[], categoryId: number): Promise<Site[]>
export async function updateSitesCategory(idOrIdArray: number | number[], categoryId: number): Promise<Site[]>
export async function updateSitesCategory(idOrIdArray: number | number[], categoryId: number): Promise<Site[]> {
  const ids = Array.isArray(idOrIdArray) ? idOrIdArray : [idOrIdArray]
  if (ids.length === 0) return []
  const response = await fetch(`/api/admin/sites/category`, {
    method: 'PATCH',
    body: JSON.stringify({
      ids,
      value: {
        categoryId,
      },
    }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update sites category: ${response.statusText}`)
  }
  const updatedSites = await response.json()
  return updatedSites as Site[]
}

export async function updateCategories(id: number, option: Omit<Category, 'id'>): Promise<Category[]>
export async function updateCategories(ids: number[], option: Omit<Category, 'id'>): Promise<Category[]>
export async function updateCategories(idOrIdArray: number | number[], option: Omit<Category, 'id'>): Promise<Category[]>
export async function updateCategories(idOrIdArray: number | number[], option: Omit<Category, 'id'>): Promise<Category[]> {
  const ids = Array.isArray(idOrIdArray) ? idOrIdArray : [idOrIdArray]
  if (ids.length === 0) return []
  const response = await fetch(`/api/admin/categories`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ids: ids,
      value: option,
    }),
  })
  if (!response.ok) {
    throw new Error(`Failed to update categories: ${response.statusText}`)
  }
  const updatedCategories = await response.json()
  return updatedCategories as Category[]
}

export async function uploadSiteFavicon(file: File) {
  const formData = new FormData()
  formData.append('favicon', file)

  const response = await fetch('/api/admin/favicon', {
    method: 'POST',
    body: formData,
  })
  if (response.ok) {
    const data = await response.json()
    return data.faviconUrl as string
  } else {
    throw new Error(`Failed to upload favicon: ${response.statusText}`)
  }
}

export async function getSiteSettings() {
  const response = await fetch('/api/admin/system')
  if (response.ok) {
    const settings = await response.json()
    return settings as SystemSettingsRecord
  } else {
    throw new Error(`Failed to fetch site settings: ${response.statusText}`)
  }
}

export async function updateSiteSettings(settings: Partial<SystemSettings>) {
  const entries = Object.entries(settings)
  const settingsToUpdate = entries.map(([key, value]) => ({
    key,
    value: value.toString(),
  }))

  const response = await fetch('/api/admin/system', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settingsToUpdate),
  })
  if (response.ok) {
    const settings = await response.json()
    return settings as SystemSettings
  } else {
    throw new Error(`Failed to update site settings: ${response.statusText}`)
  }
}

export async function updateSiteMetadata(metadata: Omit<MetaData, 'id'>[]) {
  const response = await fetch('/api/admin/metadata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ metadata }),
  })
  if (response.ok) {
    const savedMetadata = await response.json()
    return savedMetadata as MetaData[]
  } else {
    throw new Error(`Failed to update site metadata: ${response.statusText}`)
  }
}

export async function doSystemBackup(backupRestoreOptions: BackupRestoreOptions) {
  const response = await fetch('/api/admin/system/backup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(backupRestoreOptions),
  })
  if (response.ok) {
    const contentDisposition = response.headers.get('Content-Disposition')
    const filename = contentDisposition ? contentDisposition.split('filename=')[1].replace(/['"]/g, '') : 'backup.zip'
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    return {
      url,
      filename,
      revoke() {
        URL.revokeObjectURL(url)
      },
    }
  } else {
    throw new Error(`Failed to backup system: ${response.statusText}`)
  }
}

export async function doSystemRestore(backupRestoreOptions: BackupRestoreOptions, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('options', JSON.stringify(backupRestoreOptions))

  const response = await fetch('/api/admin/system/restore', {
    method: 'POST',
    body: formData,
  })
  if (response.ok) {
    return true
  } else {
    throw new Error(`Failed to restore system: ${response.statusText}`)
  }
}

export async function importBookmarks(bookmarks: Bookmarks) {
  const response = await fetch('/api/admin/system/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'bookmarks',
      data: bookmarks,
    }),
  })
  if (response.ok) {
    return true
  } else {
    throw new Error(`Failed to import bookmarks: ${response.statusText}`)
  }
}

export async function getLoginAccount() {
  const response = await fetch('/api/admin/system/login')
  if (response.ok) {
    const data = await response.json()
    return data as { username: string }
  } else {
    throw new Error(`Failed to fetch admin username: ${response.statusText}`)
  }
}

export async function login(username: string, password: string) {
  const response = await fetch('/api/admin/system/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  if (response.ok) {
    return true
  } else if (response.status === 401) {
    const body = (await response.json()) as { error: string }
    return body.error
  } else {
    throw new Error(`Failed to login: ${response.statusText}`)
  }
}

export async function testLoginValid() {
  const response = await fetch('/api/admin/system/login', {
    method: 'HEAD',
  })
  if (response.ok) {
    return true
  } else if (response.status === 401) {
    return false
  } else {
    throw new Error(`Failed to test login validity: ${response.statusText}`)
  }
}

export async function logout() {
  const response = await fetch('/api/admin/system/logout', {
    method: 'POST',
  })
  if (response.ok) {
    return true
  } else {
    throw new Error(`Failed to logout: ${response.statusText}`)
  }
}

export async function updateLoginAccount(username: string, password: string) {
  const response = await fetch('/api/admin/system/login', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  if (response.ok) {
    return true
  } else {
    throw new Error(`Failed to update login account: ${response.statusText}`)
  }
}
