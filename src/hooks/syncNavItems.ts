import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

async function syncNavToHeader(payload: any) {
  // 1. Fetch current header to preserve manual items and submenus
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  const existingNav = header.navItems || []
  const hiddenPageUrls = new Set(
    (header.navSyncHiddenPageUrls || [])
      .map((item: { url?: string }) => item?.url)
      .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0),
  )
  const lastSyncedPageUrls = new Set(
    (header.navSyncLastSyncedPageUrls || [])
      .map((item: { url?: string }) => item?.url)
      .filter((url: unknown): url is string => typeof url === 'string' && url.length > 0),
  )

  // 2. Fetch all pages so we can distinguish between page links and manual external links
  const allPages = await payload.find({ collection: 'pages', limit: 1000, depth: 0 })
  const allPageIds = new Set(allPages.docs.map((p: any) => p.id))
  const allPageUrls = new Set(allPages.docs.map((p: any) => p.slug === 'home' ? '/' : `/${p.slug}`))

  const sanitizeChildren = (children: any[] | null | undefined) => {
    if (!Array.isArray(children)) return []
    return children.filter((child) => {
      const pageRef = child?.page
      if (typeof pageRef === 'number') return allPageIds.has(pageRef)
      if (typeof pageRef === 'string') return allPageIds.has(Number(pageRef)) || allPageIds.has(pageRef)
      if (pageRef && typeof pageRef === 'object' && 'id' in pageRef) return allPageIds.has(pageRef.id)
      return false
    })
  }

  // 4. Fetch the pages that SHOULD be in the nav
  const activePages = await payload.find({
    collection: 'pages',
    where: { showInNav: { equals: true }, status: { equals: 'published' } },
    sort: ['navOrder', 'createdAt'],
    limit: 1000,
    depth: 0
  })
  const activePageUrls = new Set(
    activePages.docs.map((page: any) => (page.slug === 'home' ? '/' : `/${page.slug}`)),
  )

  // Detect page links removed manually from Header nav after previous sync and persist them as hidden.
  const currentPageUrlsInNav = new Set(
    existingNav
      .map((item: any) => item?.url)
      .filter((url: unknown): url is string => typeof url === 'string' && activePageUrls.has(url)),
  )

  for (const url of lastSyncedPageUrls) {
    if (activePageUrls.has(url) && !currentPageUrlsInNav.has(url)) {
      hiddenPageUrls.add(url)
    }
  }

  // If admin adds a previously hidden page URL back manually, unhide it.
  for (const url of currentPageUrlsInNav) {
    hiddenPageUrls.delete(url)
  }

  // If a page is newly eligible for sync, do not keep stale hidden state.
  for (const url of activePageUrls) {
    if (!lastSyncedPageUrls.has(url)) {
      hiddenPageUrls.delete(url)
    }
  }

  // Keep hidden list clean by retaining only currently active page URLs.
  const nextHiddenUrls = [...hiddenPageUrls].filter((url) => activePageUrls.has(url))
  const nextHiddenSet = new Set(nextHiddenUrls)

  // 5. Rebuild nav while PRESERVING the existing manual order.
  //    - Manual/external links stay exactly where the admin placed them.
  //    - Page links keep their current position; only their label/submenus refresh.
  //    - Pages no longer eligible are dropped; newly eligible pages are appended (by navOrder).
  const eligiblePageItems = activePages.docs
    .map((page: any) => ({
      label: page.title,
      url: page.slug === 'home' ? '/' : `/${page.slug}`,
    }))
    .filter((item: any) => !nextHiddenSet.has(item.url))

  const eligibleByUrl = new Map<string, any>(eligiblePageItems.map((p: any) => [p.url, p]))
  const placedPageUrls = new Set<string>()
  const navItems: any[] = []

  // Preserve current order for everything already in the nav.
  for (const item of existingNav) {
    if (!allPageUrls.has(item.url)) {
      // Manual / external link — keep exactly where it is.
      navItems.push(item)
      continue
    }
    // Page-derived link — keep it (in place) only if the page is still eligible.
    const match = eligibleByUrl.get(item.url)
    if (match) {
      navItems.push({
        label: match.label,
        url: item.url,
        children: sanitizeChildren(item.children),
      })
      placedPageUrls.add(item.url)
    }
  }

  // Append newly eligible pages that aren't already in the nav (in navOrder sequence).
  for (const item of eligiblePageItems) {
    if (!placedPageUrls.has(item.url)) {
      navItems.push({ label: item.label, url: item.url, children: [] })
    }
  }

  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems,
      navSyncHiddenPageUrls: nextHiddenUrls.map((url) => ({ url })),
      navSyncLastSyncedPageUrls: eligiblePageItems.map((item: any) => ({ url: item.url })),
    },
    overrideAccess: true,
  })
}

export const syncNavAfterChange: CollectionAfterChangeHook = async ({ req }) => {
  try {
    await syncNavToHeader(req.payload)
  } catch (err) {
    req.payload.logger.error(`Failed to sync nav after change: ${err}`)
  }
}

export const syncNavAfterDelete: CollectionAfterDeleteHook = async ({ req }) => {
  try {
    await syncNavToHeader(req.payload)
  } catch (err) {
    req.payload.logger.error(`Failed to sync nav after delete: ${err}`)
  }
}
