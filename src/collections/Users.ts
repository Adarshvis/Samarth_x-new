import type { CollectionConfig } from 'payload'
import { adminAccess, adminOrSelf, editorAccess, adminFieldAccess, roles } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: true,
  access: {
    read: editorAccess,
    create: adminAccess,
    update: adminOrSelf,
    delete: adminAccess,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['viewer'],
      options: roles,
      required: true,
      saveToJWT: true,
      access: {
        update: adminFieldAccess,
      },
    },
  ],
}
