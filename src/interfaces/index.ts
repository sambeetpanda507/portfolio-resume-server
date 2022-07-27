export interface IUserModel {
  _id: string
  id: string
  name: string
  email: string
  password: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface IGoogleUserModel {
  _id: string
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface IChannelModel {
  _id: string
  channelName: string
  createdBy: string
}

export interface IStrVal {
  [key: string]: {
    socketId: string
    avatar: string
    name: string
  }
}

export interface INewMsg {
  msg: string
  sender: string
  receiver: string
  time: string
  avatar: string
  type: 'OUT' | 'IN'
  view: boolean
}
