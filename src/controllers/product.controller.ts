import Product from '../models/product.model'
import { Request, Response, NextFunction } from 'express'
import { ProductSchema, IDSchema } from '../schema'
import { NotFound, BadRequest } from 'http-errors'
import mongoose from 'mongoose'

export const getProducts = async (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //get all the products from the database
    const products = await Product.find({})
    res.status(200).json({
      message: 'Proucts fetched successfully',
      products
    })
  } catch (e: any) {
    console.log('[error] : ', e.message)
    next(e)
  }
}

//POST: SAVE PRODUCT DATA
export const postSaveProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //input validation
    const { img, title, details, price, mrp } =
      await ProductSchema.validateAsync(req.body)

    //create new product obj
    const productObj = new Product({
      img,
      title,
      details,
      price,
      mrp
    })

    //save product obj to database
    const savedProduct = await productObj.save()

    //send response to client
    res.status(201).json({
      message: 'Product saved successfully',
      product: savedProduct
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

//GET: GET PRODUCT BY ID
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //INPUT VALIDATION
    const { id } = await IDSchema.validateAsync(req.params)

    //NOT A VALID MONGODB OBJECT ID
    if (mongoose.Types.ObjectId.isValid(id) === false)
      throw new BadRequest('Invalid product id')

    //GET PRODUCT BY ID
    const product = await Product.findOne({ _id: id })

    if (!product) throw new NotFound(`Product with product id ${id} not found`)

    //RESPONSE TO CLIENT
    res.json({
      message: 'Product found',
      product
    })
  } catch (e: any) {
    console.error(e.message)
    next(e)
  }
}

//DELETE: DELETE PRODUCT BY ID
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //INPUT VALIDATION
    const { id } = await IDSchema.validateAsync(req.params)

    //NOT A VALID MONGODB OBJECT ID
    if (mongoose.Types.ObjectId.isValid(id) === false)
      throw new BadRequest('Invalid product id')

    //GET PRODUCT BY ID
    const product = await Product.findOne({ _id: id })

    if (!product) throw new NotFound(`Product with product id ${id} not found`)

    //DELETE PRODUCT
    await Product.deleteOne({ _id: id })

    //RESPONSE TO CLIENT
    res.json({
      message: 'Product deleted successfully',
      productId: id
    })
  } catch (e: any) {
    console.error(e.message)
    next(e)
  }
}
