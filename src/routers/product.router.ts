import { Router } from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware'
import {
  postSaveProduct,
  getProducts,
  getProduct,
  deleteProduct
} from '../controllers/product.controller'

const productRouter = Router()

productRouter.post('/save-product', isAuthenticated, postSaveProduct)

productRouter.get('/get-products', getProducts)

productRouter.get('/get-product/:id', getProduct)

productRouter.delete('/delete-product', isAuthenticated, deleteProduct)

export default productRouter
