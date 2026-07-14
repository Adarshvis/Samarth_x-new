import { notFound, redirect } from 'next/navigation'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import { getApplicantFromCookies } from '@/lib/auth'
import BlockRenderer from '../../components/BlockRenderer'
import PageBanner from '../../components/PageBanner'
import ApplicantUserSlot from './ApplicantTopBar'

const CMS_FORM_SLUG = 'my-application'

async function getApplyPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: CMS_FORM_SLUG },
    },
    limit: 1,
    draft: true,
  })
  return docs[0] || null
}

export default async function DashboardPage() {
  const applicant = await getApplicantFromCookies()
  if (!applicant) {
    redirect('/applicant/login')
  }

  const page = await getApplyPage()
  if (!page) notFound()

  return (
    <div className="cms-page-shell">
      <PageBanner
        title={page.title}
        slug={CMS_FORM_SLUG}
        userSlot={<ApplicantUserSlot name={applicant.name} />}
      />
      <BlockRenderer blocks={page.layout} />
    </div>
  )
}
