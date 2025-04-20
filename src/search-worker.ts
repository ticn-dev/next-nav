import * as fuzzySearch from '@m31coding/fuzzy-search'
import { CategoryWithSites } from '@/types/category'
import { Site } from '@/types/site'

const searcher = fuzzySearch.SearcherFactory.createDefaultSearcher<Site, number>()

function buildMeta(data: Site[]) {
  searcher.indexEntities(
    data,
    (e) => e.id,
    (e) => [e.title, e.url, e.description || ''],
  )
}

let searchData: Site[] = []
buildMeta(searchData)

addEventListener('message', (event: MessageEvent<{ query: string } | { init: CategoryWithSites[] }>) => {
  console.log('Worker received message:', event.data)
  if ('init' in event.data) {
    searchData = event.data.init.flatMap((category) => category.sites)
    buildMeta(searchData)
    return
  }

  const { query } = event.data
  const result = searcher.getMatches(new fuzzySearch.Query(query, Infinity, 0.3))
  console.debug('Worker search result:', result)
  postMessage(result.matches.map((item) => item.entity.id))
})
