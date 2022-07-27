import Order from '../models/order.model'
import User from '../models/user.model'
import Product from '../models/product.model'
import { Request, Response, NextFunction } from 'express'
import { NotFound, BadRequest } from 'http-errors'
import { PlaceOrderSchema, IDSchema } from '../schema'
import mongoose from 'mongoose'

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
