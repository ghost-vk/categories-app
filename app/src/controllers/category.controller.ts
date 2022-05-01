import { Request, Response, NextFunction } from 'express'
import to from 'await-to-js'

import CategoryModel from '@models/category.model'
import { ApiError } from '@errors/api.error'
import { mapValidationErrors } from '@helpers/map-validation-errors'

const HTTP_BAD_REQUEST = 400
const HTTP_NOT_FOUND = 404
const HTTP_INTERNAL_ERROR = 500

class CategoryController {
  async getFilteredCategories(req: Request, res: Response, next: NextFunction) {
    const validationErrors = mapValidationErrors(req)

    if (validationErrors.length > 0) {
      return next(new ApiError(HTTP_BAD_REQUEST, 'Validation Error', validationErrors))
    }

    const [err, categories] = await to(CategoryModel.find(req.query))

    if (err) return this.handleFindErrors(err, next)

    res.json({ status: 'ok', result: categories })
  }

  private handleFindErrors(error: Error | ApiError, next: NextFunction) {
    if (error instanceof ApiError) {
      return next(
        new ApiError(
          error.status,
          error.message,
          error.errors
        )
      )
    }

    return next(
      new ApiError(
        HTTP_INTERNAL_ERROR,
        'Unhandled find categories error.',
        [error.message]
      )
    )
  }

  async getCategory(req: Request, res: Response, next: NextFunction) {
    const validationErrors = mapValidationErrors(req)

    if (validationErrors.length > 0) {
      return next(new ApiError(HTTP_BAD_REQUEST, 'Validation Error', validationErrors))
    }

    const [err, category] = await to(CategoryModel.findOne(req.params.id))

    if (err) return next(new ApiError(HTTP_NOT_FOUND, 'Category not found.'))

    res.json({ status: 'ok', category })
  }


  async addCategory(req: Request, res: Response, next: NextFunction) {
    const validationErrors = mapValidationErrors(req)

    if (validationErrors.length > 0) {
      return next(new ApiError(HTTP_BAD_REQUEST, 'Validation Error', validationErrors))
    }

    const categoryRequest = req.body.category

    const [err, category] = await to<CategoryModel|false>(
      CategoryModel.create(categoryRequest)
    )

    if (err || !category) {
      res.status(HTTP_INTERNAL_ERROR).json({ error: err?.message || 'Fail' })
      return
    }

    res.json({ status: 'ok', category })
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    const validationErrors = mapValidationErrors(req)

    if (validationErrors.length > 0) {
      return next(new ApiError(HTTP_BAD_REQUEST, 'Validation Error', validationErrors))
    }

    const [err, updatedCategory] = await to<CategoryModel>(
      CategoryModel.update(req.params.id, req.body.category)
    )

    if (err) return next(new ApiError(HTTP_BAD_REQUEST, err.message))

    res.json({ status: 'ok', category: updatedCategory })
  }

  async deleteCategoryById(req: Request, res: Response, next: NextFunction) {
    const validationErrors = mapValidationErrors(req)

    if (validationErrors.length > 0) {
      return next(new ApiError(
        HTTP_BAD_REQUEST,
        'Validation Error',
        validationErrors
      ))
    }

    const [err, deletedCategory] = await to<CategoryModel>(
      CategoryModel.deleteCategory(req.params.id)
    )

    if (err) return next(new ApiError(HTTP_BAD_REQUEST, err.message))

    res.json({ status: 'ok', category: deletedCategory })
  }
}

export default new CategoryController()
