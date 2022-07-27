import { createClient } from 'redis'
import { envConfig } from '../config/env.config'

const connectionStr: string = `redis://default:${envConfig.__REDIS_PASSWORD__}@${envConfig.__REDIS_URI__}`

export const redisClient = createClient({
  url: connectionStr
})

export const redisConntect = async () => {
  try {
    await redisClient.connect()
  } catch (e: any) {
    console.error(e.message)
    process.exit(1)
  }
}
redisClient.on('ready', () => {
  console.log('[info] : connected to redis')
})

process.on('SIGINT', async () => {
  await redisClient.disconnect()
  console.log('[info] : ', 'redis disconnected')
})
