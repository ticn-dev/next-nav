export interface Bookmark {
  title: string
  url: string
  icon?: string
}

export interface BookmarkCategory {
  title: string
  bookmarks: Bookmark[]
}

export interface Bookmarks {
  categories: BookmarkCategory[]
  uncategorized: Bookmark[]
}

function parseBookmark0(root: ParentNode, parentCategoryBookmarks: Bookmark[], categories: BookmarkCategory[]) {
  const title = root.querySelector(':scope > H3')?.textContent || undefined
  const folder = root.querySelector(':scope > DL')
  if (folder == null) {
    return
  }
  const category: BookmarkCategory | undefined = title === undefined ? undefined : { title: title, bookmarks: [] }
  const useBookmarks = category === undefined ? parentCategoryBookmarks : category.bookmarks
  const dts = folder.querySelectorAll(':scope > DT')
  for (const dt of dts) {
    const aTag = dt.querySelector(':scope > A')
    if (aTag === null) {
      parseBookmark0(dt, useBookmarks, categories)
    } else {
      const title = aTag.textContent
      const url = aTag.getAttribute('href')
      const icon = aTag.getAttribute('icon') || undefined
      if (title && url) {
        useBookmarks.push({ title, url, icon })
      } else {
        console.warn('Bookmark without title or URL:', { title, url })
      }
    }
  }

  if (category !== undefined) {
    categories.push(category)
  }
}

export function parseBookmarks(content: string): Bookmarks {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  const categories: BookmarkCategory[] = []
  const uncategorized: Bookmark[] = []
  const root = doc.body ? doc.body : doc
  parseBookmark0(root, uncategorized, categories)
  return {
    categories: categories,
    uncategorized: uncategorized,
  }
}
