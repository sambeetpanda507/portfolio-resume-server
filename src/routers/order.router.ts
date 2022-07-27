import { Router } from 'express'
import { postPlaceOrder, getOrders } from '../controllers/order.controller'

const orderRouter = Router()

orderRouter.post('/place-order', postPlaceOrder)

orderRouter.get('/get-orders/:id', getOrders)

export default orderRouter
