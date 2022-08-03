import Order from '../models/order.model'
import User from '../models/user.model'
import Product from '../models/product.model'
import { Request, Response, NextFunction } from 'express'
import { NotFound, BadRequest, BadGateway } from 'http-errors'
import {
  PlaceOrderSchema,
  IDSchema,
  PaymentSchema,
  EmailSchema
} from '../schema'
import mongoose from 'mongoose'
import Razorpay from 'razorpay'
import { envConfig } from '../config/env.config'
import crypto from 'crypto'
import Payment from '../models/payment.model'

export const postPlaceOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //INPUT SCHEMA VALIDATION
    const orderDetails = await PlaceOrderSchema.validateAsync(req.body)

    //VALIDATE MONGOOSE ID
    if (mongoose.Types.ObjectId.isValid(orderDetails.userId) === false)
      throw new BadRequest('Invalid user id')
    if (mongoose.Types.ObjectId.isValid(orderDetails.productId) === false)
      throw new BadRequest('Invalid product id')

    //VALIDATE USER ID
    const user = await User.findOne({ _id: orderDetails.userId })
    if (!user)
      throw new NotFound(`No user with user id ${orderDetails.userId} found`)

    //VALIDATE PRODUCT ID
    const product = await Product.findOne({ _id: orderDetails.productId })
    if (!product)
      throw new NotFound(
        `No product with product id ${orderDetails.productId} found`
      )

    //CREATE NEW ORDER OBJ
    const orderObj = new Order(req.body)

    //SAVE NEW ORDER
    const newOrder = await orderObj.save()

    //SEND RESPONSE TO CLIENT
    res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder
    })
  } catch (e: any) {
    console.error('[error] : ', e.message)
    if (e.isJoi === true) {
      e.status = 422
      e.param = e.details[0].context.label
    }
    next(e)
  }
}

//GET: GET ALL ORDER ON THE BASIS OR USER ID
export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //INPUT VALIDATION
    const { id: userId } = await IDSchema.validateAsync(req.params)

    //MONGOOSE OBJECT ID VALIDATION
    if (mongoose.Types.ObjectId.isValid(userId) === false)
      throw new BadRequest('Invalid user id')

    //VALIDATE USER ID
    const user = await User.findOne({ _id: userId }, { _id: 1 })
    if (!user) throw new NotFound(`user with user id ${userId} not found`)

    //GET ORDERS BASED ON USER ID
    const orders = await Order.find(
      { userId: user._id },
      { createdAt: 0, updatedAt: 0, __v: 0 }
    ).populate('productId', ['img', 'title', 'mrp', 'price'])

    //SEND RESPONSE
    res.json({
      message: 'Orders fetched successfully',
      orders
    })
  } catch (e: any) {
    console.error('[error] : ', e.message)
    if (e.isJoi === true) {
      e.status = 422
      e.param = e.details[0].context.label
    }
    next(e)
  }
}

//POST: MAKE PAYMENT RAZORPAY
export const postRazorpay = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = await PaymentSchema.validateAsync(req.body)

    const instance = new Razorpay({
      key_id: envConfig.__RZ_PAY_API_KEY__,
      key_secret: envConfig.__RZ_PAY_API_SECRET__
    })

    const orderOpt = {
      amount: amount * 100,
      currency: 'INR',
      receipt: 'order_receipt_id11'
    }

    const paymentRes = await instance.orders.create(orderOpt)

    res.json({ message: 'Successfully created order', orderId: paymentRes.id })
  } catch (e: any) {
    console.error('[error] : ', e.message)
    if (e.isJoi === true) {
      e.status = 422
      e.param = e.details[0].context.label
    }
    next(e)
  }
}

//POST: STORE PAYMENT DATA
export const postStorePaymentData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const instance = new Razorpay({
      key_id: envConfig.__RZ_PAY_API_KEY__,
      key_secret: envConfig.__RZ_PAY_API_SECRET__
    })

    const paymentDetails = await instance.payments.fetch(req.body.paymentId)

    const paymentObj = new Payment({
      paymentId: paymentDetails.id,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      email: paymentDetails.email,
      contact: paymentDetails.contact,
      orders: req.body.cart
    })

    await paymentObj.save()

    res.status(201).json({ message: 'Payment successfull' })
  } catch (e: any) {
    console.error('[error] : ', e.message)
    next(e)
  }
}

//POST: VERIFY PAYMENT(WEBHOOK)
export const postVerifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //VALIDATE SIGNATURE
    const webhookSecret: string = '490827c0-c570-4888-927e-c554540aff24'
    const shasum = crypto.createHmac('sha256', webhookSecret)
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest('hex')
    const signatureHeader = req.headers['x-razorpay-signature']
    if (digest !== signatureHeader) throw new BadGateway()
    res.send({ status: 'ok' })
  } catch (e: any) {
    console.error('[error] : ', e.message)
    next(e)
  }
}

//GET: PAYMENT DATA BY EMAIL
export const getOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = await EmailSchema.validateAsync(req.query)
    const paymentData = await Payment.find({ email: email })
    res
      .status(200)
      .json({ message: 'Data fetched successfully', orderDetails: paymentData })
  } catch (e: any) {
    console.error('[error] : ', e.message)
    if (e.isJoi === true) {
      e.status = 422
      e.param = e.details[0].context.label
    }
    next(e)
  }
}
