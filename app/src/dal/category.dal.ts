import { categoryFieldsDb } from '@src/types/category-fields.db'
import { categoryFields } from '@src/types/category-fields'

export const categoryDal = (fields: categoryFieldsDb): categoryFields => ({
  id: fields.id,
  slug: fields.slug,
  name: fields.name,
  description: fields.description,
  createdDate: fields.created_date,
  active: fields.active
})
