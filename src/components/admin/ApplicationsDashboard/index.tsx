import { getPayload } from 'payload'
import config from '@/payload.config'
import ApplicationsDashboardClient from './ApplicationsDashboardClient'

export default async function ApplicationsDashboardView() {
  const payload = await getPayload({ config })

  const applications = await payload.find({
    collection: 'job-applications' as any,
    overrideAccess: true,
    depth: 1,
    limit: 200,
    sort: '-createdAt',
  })

  const docs = applications.docs as any[]

  // Compute stats
  const total = docs.length
  const statusCounts = docs.reduce(
    (acc: Record<string, number>, doc: any) => {
      const s = doc.status || 'new'
      acc[s] = (acc[s] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <ApplicationsDashboardClient
      applications={docs}
      stats={{
        total,
        new: statusCounts['new'] || 0,
        reviewed: statusCounts['reviewed'] || 0,
        shortlisted: statusCounts['shortlisted'] || 0,
        rejected: statusCounts['rejected'] || 0,
      }}
    />
  )
}
