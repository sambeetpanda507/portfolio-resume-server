import mongoose from 'mongoose'
import { envConfig } from '../config/env.config'

export const connectToDb = async (): Promise<void> => {
  try {
    //database uri on the basis of node env
    const dbURI =
      envConfig.__NODE_ENV__ === 'production'
        ? envConfig.__DB_URI_PROD__
        : envConfig.__DB_URI_DEV__

    //connect to database
    await mongoose.connect(dbURI)

    //stdout
    console.info('[info] : connected to database')
  } catch (e: any) {
    console.log(e.message)
    process.exit(1)
  }
}

//on ctrl+c close db connection
process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('[info] : ', 'mongoose disconnected')
  process.exit(0)
})
