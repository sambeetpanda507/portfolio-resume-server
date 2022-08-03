import { model, Model, Schema } from 'mongoose'
import { paymentType } from '../types'

const schema = new Schema<paymentType, Model<paymentType>, paymentType>(
  {
    paymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    orders: [{ name: String, count: Number, mrp: Number, price: Number }]
  },
  { timestamps: true }
)

const PaymentModel = model<paymentType>('payment', schema)

export default PaymentModel
