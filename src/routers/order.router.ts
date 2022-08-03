import { Router } from 'express'
import {
  postPlaceOrder,
  getOrders,
  postRazorpay,
  postVerifyPayment,
  postStorePaymentData,
  getOrderDetails
} from '../controllers/order.controller'

const orderRouter = Router()

orderRouter.post('/place-order', postPlaceOrder)

orderRouter.get('/get-orders/:id', getOrders)

orderRouter.get('/get-orders', getOrderDetails)

orderRouter.post('/store-payment-data', postStorePaymentData)

orderRouter.post('/razorpay', postRazorpay)

orderRouter.post('/verify-payment', postVerifyPayment)

export default orderRouter
