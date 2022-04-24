import to from 'await-to-js'

import db from '@db/index'
import { categoryDal } from '@dal/category.dal'
import { categoryFields } from '@src/types/category-fields'
import { selectCategoryDbResponse } from '@src/types/select-category-db-response'
import { updateCategoryRequest } from '@src/types/update-category-request'
import { acceptedParams } from '@src/types/accepted-params'
import { buildCategoryQueryFilter } from '@helpers/build-category-query-filter'

class CategoryModel {
  id: number
  slug: string
  name: string
  description?: string
  createdDate: Date
  active: boolean

  constructor(fields: categoryFields) {
    this.id = fields.id
    this.slug = fields.slug
    this.name = fields.name
    this.description = fields.description
    this.createdDate = fields.createdDate
    this.active = fields.active
  }

  static async create(fields: categoryFields): Promise<CategoryModel | false> {
    const query = `
      INSERT INTO category(slug, name, description, created_date, active)
      VALUES ($1, $2, $3, DEFAULT, $4) 
      RETURNING *`
    const description = fields.description ? fields.description : null

    const [err, dbResponse] = await to<selectCategoryDbResponse>(db.query(
        query,
        [fields.slug, fields.name, description, fields.active]
    ))

    if (err) return false

    const dal = categoryDal(dbResponse.rows[0])
    return new CategoryModel(dal)
  }

  static async findOne(id: number|string) {
    let query = 'SELECT * FROM category WHERE '
    query += Number(id) > 0 ? 'id = $1' : 'slug = $1'

    const [dbErr, dbResponse] = await to<selectCategoryDbResponse>(
      db.query(query, [id])
    )

    if (dbErr) throw new Error('Database error.')

    if (dbResponse.rows.length === 0) throw new Error('Category not found.')

    return new CategoryModel(categoryDal(dbResponse.rows[0]))
  }

  static async update(id: number|string, updateRequest: updateCategoryRequest) {
    const [countError, rowsCountResponse] = await to<{ rows: any }>(
      db.query(
        'SELECT COUNT(*) FROM category WHERE id = $1',
        [id]
      )
    )

    if (countError) throw new Error('Select category count error.')

    if (rowsCountResponse?.rows.length < 1) {
      throw new Error('Not found category to update.')
    }

    const updateStatements = []
    const parameters = []
    let idx = 1

    for (const [key, value] of Object.entries(updateRequest)) {
      updateStatements.push(`${key} = $${idx}`)
      parameters.push(value)
      idx += 1
    }

    if (updateStatements.length === 0) {
      throw new Error('No provided fields to update.')
    }

    const updateQuery = `
      UPDATE category SET ${updateStatements.join(', ')}
      WHERE id = $${idx}
      RETURNING *`;

    parameters.push(id)

    const [updateError, updateResponse] = await to<selectCategoryDbResponse>(
      db.query(updateQuery, parameters)
    )

    if (updateError) throw new Error('Update failure.')

    const row = updateResponse.rows[0]

    return new CategoryModel(categoryDal(row))
  }

  static async deleteCategory(id: string|number) {
    const [dbErr, dbResponse] = await to<selectCategoryDbResponse>(
      db.query(
        'DELETE FROM category WHERE id = $1 RETURNING *',
        [id]
      )
    )

    if (dbErr) throw new Error('Delete failure.')

    if (dbResponse.rows.length === 0) throw new Error('Not found.')

    return new CategoryModel(categoryDal(dbResponse.rows[0]))
  }

  static async find(params: acceptedParams): Promise<CategoryModel[]> {
    const queryBuild = buildCategoryQueryFilter(params)

    if (typeof queryBuild === 'string') throw new Error(queryBuild)

    console.log('Query:\n', queryBuild)

    const [dbErr, dbResponse] = await to<selectCategoryDbResponse>(
      db.query(queryBuild.query, queryBuild.params)
    )

    console.log(dbErr)
    if (dbErr) throw new Error('Select failure.')

    if (dbResponse.rows.length === 0) return []

    const categories = []
    for (const row of dbResponse.rows) {
      categories.push(new CategoryModel(categoryDal(row)))
    }

    return categories
  }
}

export default CategoryModel
