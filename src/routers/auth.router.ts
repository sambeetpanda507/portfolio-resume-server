import { Router } from 'express'
import {
  getAccessToken,
  getUserData,
  postLoginUser,
  postRegisterUser,
  getLogout,
  postGoogleLogin
} from '../controllers/auth.controller'
import { isAuthenticated } from '../middlewares/auth.middleware'

// router init
const authRouter = Router()

authRouter.post('/register-user', postRegisterUser)

authRouter.post('/login-user', postLoginUser)

authRouter.get('/get-access-token', getAccessToken)

//google login
authRouter.post('/google-oauth', postGoogleLogin)

//protected
authRouter.get('/get-user-data', isAuthenticated, getUserData)

authRouter.get('/logout', getLogout)

export default authRouter
