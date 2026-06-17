import 'dotenv/config'
import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', async () => {
  return { status: 'ok' }
})

const port = Number(process.env.PORT) || 3333
const host = '0.0.0.0'

app.listen({ port, host }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
