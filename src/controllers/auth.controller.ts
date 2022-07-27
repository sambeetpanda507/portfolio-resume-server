import bcrypt from 'bcrypt'
import UserModel from '../models/user.model'
import GoogleUserModel from '../models/googlUser.model'
import { NextFunction, Request, Response } from 'express'
import {
  createAccessToken,
  createAccessTokenForGoogle,
  createRefreshToken,
  createRefreshTokenForGoogle
} from '../utils/token'
import { verify } from 'jsonwebtoken'
import { envConfig } from '../config/env.config'
import {
  BadRequest,
  NotFound,
  Unauthorized,
  Conflict,
  InternalServerError
} from 'http-errors'
import { RegisterSchema, LoginSchema, GoogleLoginSchema } from '../schema'
import { redisClient } from '../utils/redis'

//POST: register user
export const postRegisterUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // input error validation
    const { name, email, avatar, password } =
      await RegisterSchema.validateAsync(req.body)

    //check email alreay exist
    const user = await UserModel.findOne({ email: email })

    if (user) throw new Conflict('User already exist.')

    //hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    if (!hashedPassword)
      throw new InternalServerError('Oops some error occured')

    //create user
    const userData = new UserModel({
      name,
      email,
      password: hashedPassword,
      avatar
    })

    const createdUser = await userData.save()

    res.status(201).json({
      message: 'Registration successfull',
      userData: {
        userId: createdUser.id,
        name,
        email,
        avatar
      }
    })
  } catch (e: any) {
    console.log('[error] : ', e.message)
    if (e.isJoi === true) {
      e.status = 422
      e.param = e.details[0].context.label
    }
    next(e)
  }
}

//POST: login user
export const postLoginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //validation error
    const { email, password } = await LoginSchema.validateAsync(req.body)

    // check if valid email
    const user = await UserModel.findOne({ email: email })

    if (!user) throw new NotFound('User not registered.')

    //check if valid password
    const isValidPass: boolean = await bcrypt.compare(password, user.password)

    if (isValidPass === false)
      throw new Unauthorized('Invalid email or password')

    //both email and password is valid upto this point
    //create refresh token
    await createRefreshToken(res, user)
    const accessToken = createAccessToken(user)

    //send res
    res.status(200).json({
      message: 'Login successfull',
      auth: true,
      userData: {
        userId: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        accessToken
      }
    })
  } catch (e: any) {
    console.log('[error] : ', e.message)
    if (e.isJoi === true) next(new BadRequest('Invalid email or password'))
    else next(e)
  }
}

//GET: get new access token if refresh token is valid
export const getAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get refresh token from cookie
    const refreshToken = req.cookies.refresh_token

    //if there is no refresh token in req.cookie
    if (!refreshToken) throw new Unauthorized()

    let payload: any = null

    try {
      payload = verify(refreshToken, envConfig.__JWT_REFRESH_SECRET__)
    } catch (e: any) {
      console.error('[error]: ', e.message)
      throw new Unauthorized()
    }

    //token is verified upto this point
    const { userId } = payload

    //verify refresh token in redis
    const redisRefToken = await redisClient.get(userId)

    if (!redisRefToken) throw new Unauthorized()

    //check valid user id
    const user = await UserModel.findOne({ _id: userId })
    const googleUser = await GoogleUserModel.findOne({ _id: userId })

    if (!user && !googleUser) throw new Unauthorized()

    //generate new refresh token and access token
    let accessToken: string = ''
    if (user) {
      await createRefreshToken(res, user)
      accessToken = createAccessToken(user)
      res.status(200).json({
        message: 'New access token',
        auth: true,
        userData: {
          userId: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          accessToken
        }
      })
    } else if (googleUser) {
      await createRefreshTokenForGoogle(res, googleUser)
      accessToken = createAccessTokenForGoogle(googleUser)
      res.status(200).json({
        message: 'New access token',
        auth: true,
        userData: {
          userId: googleUser.id,
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.avatar,
          accessToken
        }
      })
    }
  } catch (e: any) {
    console.error('[error] : ', e.message)
    next(e)
  }
}

//GET: get user data if userId is present in req.userId
export const getUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.userId === null) throw new Unauthorized()

    //find user with user id
    const user = await UserModel.findOne({ _id: req.userId })

    if (!user) throw new NotFound('User not registered.')

    res.json({
      message: 'Ok',
      userData: {
        userId: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    })
  } catch (e: any) {
    console.error('[error] : ', e.message)

    next(e)
  }
}

//GET: log out
export const getLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get refresh token from cookie
    const refreshToken = req.cookies.refresh_token

    if (!refreshToken) throw new BadRequest()

    let payload: any = null

    try {
      payload = verify(refreshToken, envConfig.__JWT_REFRESH_SECRET__)
    } catch (e: any) {
      console.error('[error]: ', e.message)
      throw new Unauthorized()
    }

    //token is verified upto this point
    const { userId } = payload

    //delete refresh token stored in redis
    await redisClient.del(userId)

    res
      .clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: envConfig.__NODE_ENV__ === 'production' ? 'none' : 'strict',
        secure: envConfig.__NODE_ENV__ === 'production'
      })
      .json({
        message: 'Successfully logged out',
        auth: false,
        accessToken: null
      })
  } catch (e: any) {
    console.error('[error] : ', e.message)
    next(e)
  }
}

//POST: google o auth
export const postGoogleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //input validation
    const { name, email, avatar } = await GoogleLoginSchema.validateAsync(
      req.body
    )

    //check user with email already present in collection
    const user = await GoogleUserModel.findOne({ email: email })

    if (user) {
      //user already present
      //generate refresh token
      await createRefreshTokenForGoogle(res, user)

      //generate access token
      const accessToken = createAccessTokenForGoogle(user)

      //send res
      res.json({
        message: 'Login Successfull',
        auth: true,
        userData: {
          userId: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          accessToken
        }
      })
    } else {
      //store user information in collection
      const newUser = new GoogleUserModel({
        name,
        email,
        avatar
      })

      const savedUser = await newUser.save()

      //generate accesstoken
      const accessToken = createAccessTokenForGoogle(savedUser)

      //generate refreshtoken
      await createRefreshTokenForGoogle(res, savedUser)

      //send response
      res.json({
        message: 'Login Successfull',
        auth: true,
        userData: {
          userId: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          avatar: savedUser.avatar,
          accessToken
        }
      })
    }
  } catch (e: any) {
    console.error('[error] : ', e.message)
    if (e.isJoi === true) {
      e.status = 422
      e.param = e.details[0].context.label
    }
    next(e)
  }
}
