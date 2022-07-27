import { model, Model, Schema } from 'mongoose'
import { IGoogleUserModel } from '../interfaces'

const schema = new Schema<
  IGoogleUserModel,
  Model<IGoogleUserModel>,
  IGoogleUserModel
>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: String
  },
  { timestamps: true }
)

const GoogleUserModel = model<IGoogleUserModel>('GooglUser', schema)

export default GoogleUserModel
