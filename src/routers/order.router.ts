import { Router } from 'express'
import {
  postPlaceOrder,
  getOrders,
  postRazorpay,
  postVerifyPayment,
  postStorePaymentData
} from '../controllers/order.controller'

const orderRouter = Router()

orderRouter.post('/place-order', postPlaceOrder)

orderRouter.get('/get-orders/:id', getOrders)

orderRouter.post('/store-payment-data', postStorePaymentData)

orderRouter.post('/razorpay', postRazorpay)

orderRouter.post('/verify-payment', postVerifyPayment)

export default orderRouter
