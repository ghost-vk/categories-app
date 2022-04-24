import { Request, Response, NextFunction } from 'express'

import { ApiError } from '@errors/api.error'

export default function(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ error: err.message, errors: err.errors })
  }

  return res.status(500).json({ error: 'Unhandled Error' })
}
