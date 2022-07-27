import { ErrorRequestHandler } from 'express'

type payloadType = {
  error:
    | {
        status: number
        message: string
      }
    | {
        status: number
        message: string
        param: string
      }
}

const errorHandler: ErrorRequestHandler = (err: any, _, res, __) => {
  const status = err.status || 500
  const message = err.message
  const payload: payloadType = err.param
    ? {
        error: {
          status,
          message,
          param: err.param
        }
      }
    : {
        error: {
          status,
          message
        }
      }

  res.status(status).send(payload)
}

export default errorHandler
