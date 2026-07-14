import type { Access, FieldAccess } from 'payload'

export type Role = 'super_admin' | 'school_admin' | 'content_editor' | 'viewer'

export const roles: { label: string; value: Role }[] = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'School Admin', value: 'school_admin' },
  { label: 'Content Editor', value: 'content_editor' },
  { label: 'Viewer', value: 'viewer' },
]

function hasRole(user: any, role: Role[]): boolean {
  if (!user?.roles) return false
  return user.roles.some((r: string) => role.includes(r as Role))
}

export const isAdmin = (user: any): boolean => hasRole(user, ['super_admin'])

export const isSchoolAdmin = (user: any): boolean =>
  hasRole(user, ['super_admin', 'school_admin'])

export const isEditor = (user: any): boolean =>
  hasRole(user, ['super_admin', 'school_admin', 'content_editor'])

export const isLoggedIn = (user: any): boolean => Boolean(user)

// Collection-level access helpers
export const adminAccess: Access = ({ req: { user } }) => isAdmin(user)

export const schoolAdminAccess: Access = ({ req: { user } }) => isSchoolAdmin(user)

export const editorAccess: Access = ({ req: { user } }) => isEditor(user)

export const loggedInAccess: Access = ({ req: { user } }) => isLoggedIn(user)

export const publicAccess: Access = () => true

export const adminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return { id: { equals: user.id } }
}

// Published pages: public can read published, editors can read all
export const publishedOrEditor: Access = ({ req: { user } }) => {
  if (user && isEditor(user)) return true
  return { status: { equals: 'published' } }
}

// Field-level access helpers
export const adminFieldAccess: FieldAccess = ({ req: { user } }) => isAdmin(user)

export const editorFieldAccess: FieldAccess = ({ req: { user } }) => isEditor(user)
