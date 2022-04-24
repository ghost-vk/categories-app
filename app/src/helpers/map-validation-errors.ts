import { Request } from 'express'
import { validationResult } from 'express-validator'

export const mapValidationErrors = (req: Request): string[] => {
  const validationErrors = validationResult(req)

  if (validationErrors.isEmpty()) return []

  return validationErrors
    .array({ onlyFirstError: true })
    .map(err => `Error: '${err.msg}' in '${err.param}'`)
}
