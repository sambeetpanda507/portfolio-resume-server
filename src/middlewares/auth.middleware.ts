import { Request, NextFunction, Response } from 'express'
import { verify } from 'jsonwebtoken'
import { envConfig } from '../config/env.config'
import { Unauthorized } from 'http-errors'

export const isAuthenticated = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  try {
    //get token from header
    const accessToken = req.headers['authorization']

    //if no access token
    if (!accessToken) throw new Unauthorized()

    const token: string | undefined = accessToken.split(' ')[1]

    if (!token) throw new Unauthorized()

    //verify access token
    const payload: any = verify(token, envConfig.__JWT_ACCESS_SECRET)

    if (!payload) throw new Unauthorized()

    //set userId in request
    req.userId = payload.userId
    next()
  } catch (e: any) {
    console.error('[error] : ', e.message)
    next(new Unauthorized())
  }
}
