import { model, Model, Schema } from 'mongoose'
import { IUserModel } from '../interfaces'

const schema = new Schema<IUserModel, Model<IUserModel>, IUserModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: String
  },
  { timestamps: true }
)

const UserModel = model<IUserModel>('User', schema)

export default UserModel
