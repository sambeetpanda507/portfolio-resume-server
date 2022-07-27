import express, { Router } from 'express'
import {
  getAllChannels,
  postCreateChannel
} from '../controllers/chat.controller'
import { isAuthenticated } from '../middlewares/auth.middleware'

const chatRouter: Router = express.Router()

chatRouter.post(
  '/create-channel',

  isAuthenticated,
  postCreateChannel
)

chatRouter.get('/get-channels', isAuthenticated, getAllChannels)

export default chatRouter
