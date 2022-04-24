import 'module-alias/register'
import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'

import CategoryRouter from '@routers/category.router'
import errorInterceptorMiddleware
  from '@middlewares/error-interceptor.middleware'

dotenv.config({ path: `${process.cwd()}/env/.env` })

const app: Express = express()
const port = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/categories', CategoryRouter)

app.all('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Resourse not found' })
})

app.use(errorInterceptorMiddleware)

app.listen(port, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${port}`)
})

