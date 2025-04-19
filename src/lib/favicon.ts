export async function fetchIcon(url: string): Promise<{ iconUrl: string; contentType?: string; iconData: Uint8Array } | undefined> {
  try {
    // Extract domain from URL
    const urlObj = new URL(url)
    const domain = urlObj.hostname

    // Try to fetch favicon from common locations
    const iconLocations = [
      `${urlObj.origin}/favicon.ico`,
      `${urlObj.origin}/favicon.png`,
      `${urlObj.origin}/apple-touch-icon.png`,
      `${urlObj.origin}/apple-touch-icon-precomposed.png`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    ]

    // Try each location until we find one that works
    for (const iconUrl of iconLocations) {
      try {
        const response = await fetch(iconUrl, { method: 'GET' })
        if (response.ok) {
          const contentType = response.headers.get('content-type') || undefined
          const iconData = await response.bytes()
          return { iconUrl, contentType, iconData }
        }
      } catch (e) {
        // Continue to next location
        console.error('Error fetching icon from', iconUrl, e)
      }
    }

    // If all else fails, use Google's favicon service
    const googleIconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    const response = await fetch(googleIconUrl, { method: 'GET' })
    if (response.ok) {
      const iconData = await response.bytes()
      const contentType = response.headers.get('content-type') || undefined
      return { iconUrl: googleIconUrl, contentType, iconData }
    }

    return undefined
  } catch (error) {
    console.error('Error fetching icon:', error)
    return undefined
  }
}
