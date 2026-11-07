// Copies prices from logout.world into data/logout-prices.json. Runs before every build (npm run sync:logout by hand).
// Only published events count: an unpublished event's price may be stale, so that product keeps its catalogue price.
// A failed sync warns and keeps the last good file, so logout.world being down never stops a deploy.
import { readFileSync, writeFileSync } from 'node:fs'

const OUT = 'data/logout-prices.json'
const slugs = JSON.parse(readFileSync('data/logout-slugs.json', 'utf8'))

try { process.loadEnvFile('.env.local') } catch {}
const token = process.env.LOGOUT_API_TOKEN?.trim()

async function events() {
  const all = []
  for (let page = 1, total = 1; page <= total; page++) {
    const res = await fetch(`https://logout.world/api/company/events/?page=${page}`, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' }, signal: AbortSignal.timeout(20_000) })
    if (!res.ok) throw new Error(`logout.world returned ${res.status}`)
    const data = await res.json()
    all.push(...data.results)
    total = data.total_pages
  }
  return all
}

if (!token) console.warn(`[sync-logout] LOGOUT_API_TOKEN is not set; keeping ${OUT}`)
else try {
  const list = await events()
  const prices = {}
  for (const [product, slug] of Object.entries(slugs)) {
    const e = list.find(x => x.slug === slug)
    if (e?.publish && e.price) prices[product] = e.price
  }
  writeFileSync(OUT, `${JSON.stringify(prices, null, 2)}\n`)
  console.log(`[sync-logout] ${Object.keys(prices).length} prices from ${list.length} events`)
} catch (e) {
  console.warn(`[sync-logout] ${e.message}; keeping ${OUT}`)
}
