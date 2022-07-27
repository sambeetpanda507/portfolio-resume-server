import { model, Model, Schema } from 'mongoose'
import { IChannelModel } from '../interfaces'

const schema = new Schema<IChannelModel, Model<IChannelModel>, IChannelModel>(
  {
    channelName: { required: true, type: String, unique: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

const ChannelModel = model<IChannelModel>('Channel', schema)

export default ChannelModel
