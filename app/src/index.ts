import 'module-alias/register'
import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import * as swaggerDocument from '@config/openapi.json'

import CategoryRouter from '@routers/category.router'
import errorInterceptorMiddleware
  from '@middlewares/error-interceptor.middleware'

dotenv.config({ path: `${process.cwd()}/env/.env` })

const app: Express = express()
const port = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/categories', CategoryRouter)

app.all('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Resource not found' })
})

app.use(errorInterceptorMiddleware)

app.listen(port, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${port}`)
})

