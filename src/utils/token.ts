import { Response } from 'express'
import { sign } from 'jsonwebtoken'
import { envConfig } from '../config/env.config'
import { IUserModel, IGoogleUserModel } from '../interfaces'
import { redisClient } from './redis'
import { InternalServerError } from 'http-errors'

export const createRefreshToken = async (res: Response, user: IUserModel) => {
  //sign a new refresh token
  const refreshToken = sign(
    { userId: user.id },
    envConfig.__JWT_REFRESH_SECRET__,
    {
      expiresIn: '5h'
    }
  )

  //add refresh token to redis
  try {
    await redisClient.set(user.id, refreshToken, {
      EX: 5 * 60 * 60
    })
  } catch (e: any) {
    console.log(e.message)
    throw new InternalServerError()
  }

  //add refresh token to cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    sameSite: envConfig.__NODE_ENV__ === 'production' ? 'none' : 'strict',
    secure: envConfig.__NODE_ENV__ === 'production'
  })
}

export const createRefreshTokenForGoogle = async (
  res: Response,
  user: IGoogleUserModel
) => {
  //sign a new refresh token
  const refreshToken = sign(
    { userId: user.id },
    envConfig.__JWT_REFRESH_SECRET__,
    {
      expiresIn: '5h'
    }
  )

  //add refresh token to redis
  try {
    await redisClient.set(user.id, refreshToken, {
      EX: 5 * 60 * 60
    })
  } catch (e: any) {
    console.log(e.message)
    throw new InternalServerError()
  }

  //add refresh token to cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    sameSite: envConfig.__NODE_ENV__ === 'production' ? 'none' : 'strict',
    secure: envConfig.__NODE_ENV__ === 'production'
  })
}

export const createAccessToken = (user: IUserModel): string => {
  return sign({ userId: user.id }, envConfig.__JWT_ACCESS_SECRET, {
    expiresIn: '1h'
  })
}

export const createAccessTokenForGoogle = (user: IGoogleUserModel): string => {
  return sign({ userId: user.id }, envConfig.__JWT_ACCESS_SECRET, {
    expiresIn: '1h'
  })
}
