import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const payload = await getPayload({ config })
const resolved = await config
let failures = 0

for (const c of resolved.collections) {
  try {
    await payload.find({ collection: c.slug, limit: 1, depth: 1 })
    console.log('  collection OK:', c.slug)
  } catch (e) {
    failures++
    console.error('  collection FAIL:', c.slug, '->', e?.cause?.message || e?.message)
  }
}
for (const g of resolved.globals) {
  try {
    await payload.findGlobal({ slug: g.slug, depth: 1 })
    console.log('  global OK:', g.slug)
  } catch (e) {
    failures++
    console.error('  global FAIL:', g.slug, '->', e?.cause?.message || e?.message)
  }
}
console.log(failures === 0 ? '\nALL SCHEMA READS PASSED' : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
