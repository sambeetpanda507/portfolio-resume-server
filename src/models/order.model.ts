import { model, Model, Schema } from 'mongoose'
import { orderType } from '../types'

const schema = new Schema<orderType, Model<orderType>, orderType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)

const OrderModel = model<orderType>('Order', schema)

export default OrderModel
