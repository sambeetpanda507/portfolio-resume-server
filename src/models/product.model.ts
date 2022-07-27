import { model, Model, Schema } from 'mongoose'
import { productType } from '../types'

const schema = new Schema<productType, Model<productType>, productType>(
  {
    img: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    mrp: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    details: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

const ProductModel = model<productType>('Product', schema)

export default ProductModel
