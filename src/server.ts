import path from 'path'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors, { CorsOptions } from 'cors'
import express, { Response } from 'express'
import { instrument } from '@socket.io/admin-ui'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { envConfig } from './config/env.config'
import { connectToDb } from './utils/db'
import { NotFound } from 'http-errors'
import { redisConntect } from './utils/redis'
import authRouter from './routers/auth.router'
import chatRouter from './routers/chat.router'
import errorHandler from './utils/errorHandler'
import { IStrVal, INewMsg } from './interfaces'
import productRouter from './routers/product.router'
import orderRouter from './routers/order.router'
import fs from 'fs'

//main function
const main = async () => {
  //express app initialization
  const app = express()
  const httpServer = createServer(app)

  //middleware configurations/options
  //cors options configuration
  const corsOptions: CorsOptions = {
    origin: [envConfig.__CLIENT_URI__, 'http://localhost:4000'],
    credentials: true
  }

  //views path
  const viewsPath = path.join(__dirname, 'views')

  //morgan format configuration
  const morganFormat: string =
    envConfig.__NODE_ENV__ === 'development' ? 'dev' : 'combined'

  //middleware
  app.use(morgan(morganFormat))
  app.use(cors(corsOptions))
  app.use(cookieParser(envConfig.__COOKIE_SECRET__))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(path.join(__dirname, 'public')))

  //view engine
  app.set('view engine', 'ejs')
  app.set('views', viewsPath)

  /**
   * -------------------
   * DATABASE CONNECTION
   * -------------------
   */
  await Promise.all([connectToDb(), redisConntect()])

  /*
     -------------------------------
        SOCKET CONNECTION : START
     -------------------------------
   */
  const io = new Server(httpServer, {
    cors: {
      origin: [envConfig.__CLIENT_URI__]
    }
  })

  instrument(io, {
    auth: false,
    namespaceName: '/socket'
  })

  //online socket users
  let onlineUsers: IStrVal = {}

  io.of('/socket').on('connection', (socket) => {
    console.log('[info] : ', 'socket io client count: ', io.engine.clientsCount)

    socket.emit('connection', {
      message: 'connected to server',
      socketId: socket.id
    })

    //disconnection
    socket.on('disconnect', (reason) => {
      console.log(`user (${socket.id}) disconnected: `, reason)
      const clientCount: number = io.engine.clientsCount
      console.log('[info] : ', 'socket io client count: ', clientCount)
      //remove user from onlineUsers
      for (let u in onlineUsers) {
        if (onlineUsers[u].socketId === socket.id) {
          delete onlineUsers[u]
        }
      }
      //broadcast online users to others
      io.of('/socket').emit('NEW_USER', onlineUsers)
    })

    //new user
    socket.on(
      'NEW_USER',
      ({
        email,
        name,
        avatar
      }: {
        email: string
        name: string
        avatar: string
      }) => {
        console.log('[info] :', 'new user connected: ', email)
        onlineUsers[email] = { socketId: socket.id, name, avatar }
        //broadcast online users to others
        io.of('/socket').emit('NEW_USER', onlineUsers)
      }
    )

    //new msg
    socket.on('NEW_MSG', (newMsg: INewMsg) => {
      const type: 'OUT' | 'IN' = newMsg.type === 'IN' ? 'OUT' : 'IN'
      const socketId: string = onlineUsers[newMsg.receiver].socketId

      //send private message to the user
      const updatedMsg: INewMsg = {
        ...newMsg,
        type
      }

      io.of('/socket').to(socketId).emit('NEW_MSG', updatedMsg)
    })
  })
  /*
     ---------------------------
        SOCKET CONNECTION: END
     ---------------------------
   */

  //default router
  app.get('/', (_, res: Response) => {
    res.render('index')
  })

  //router middleware
  app.use('/auth', authRouter)
  app.use('/api', chatRouter)
  app.use('/api', productRouter)
  app.use('/api', orderRouter)
  app.get('/api/download-resume', (_, res) => {
    const filePath = path.join(__dirname, '../', 'resume.pdf')
    const fileName = path.basename(filePath)
    const mimeType = 'application/pdf'
    res.setHeader('Content-disposition', 'attachment; filename=' + fileName)
    res.setHeader('Content-type', mimeType)
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  })

  //express error handler
  app.use((_, __, next) => {
    next(new NotFound('Page not found'))
  })
  app.use(errorHandler)

  httpServer.listen(envConfig.__PORT__, () => {
    console.log(`[info] : server is listening on port: ${envConfig.__PORT__}`)
  })
}

main().catch((error: any) => console.error('[error]: ', error.message))
