import { Router } from 'express'
import { check, query, param } from 'express-validator'

import CategoryController from '@controllers/category.controller'

const router = Router()

router.get(
  '/',
  query('name').optional().isString(),
  query('description').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt(),
  query('pageSize').optional().isInt(),
  query('sort').optional().isString(),
  CategoryController.getFilteredCategories
)

router.post(
  '/',
  check('category.name').notEmpty().isString(),
  check('category.slug').isString(),
  check('category.description').optional().isString(),
  check('category.active').notEmpty().isBoolean(),
  CategoryController.addCategory,
)

router.get(
  '/:id',
  param('id').notEmpty(),
  CategoryController.getCategory
)

router.patch(
  '/:id',
  param('id').notEmpty().isInt(),
  check('category.name').optional().isString(),
  check('category.slug').optional().isString(),
  check('category.description').optional().isString(),
  check('category.active').optional().isBoolean(),
  CategoryController.updateCategory,
)

router.delete(
  '/:id',
  param('id').notEmpty().isInt(),
  CategoryController.deleteCategoryById
)

export default router
