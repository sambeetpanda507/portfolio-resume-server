import { Request, Response } from 'express'
import ChannelModel from '../models/channel.model'

export const postCreateChannel = async (req: Request, res: Response) => {
  try {
    const { channelName, createdBy } = req.body

    const isChannelExist = await ChannelModel.findOne({ channelName })
    if (isChannelExist) {
      return res.status(400).json({ message: 'Channel already exist.' })
    }

    const channel = new ChannelModel({
      channelName,
      createdBy
    })

    const result = await channel.save()
    console.log(result)
    return res.status(201).json({
      message: 'Channel created successfully.',
      details: result
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getAllChannels = async (req: Request, res: Response) => {
  try {
    console.log('ip : ', req.ip)
    const channels = await ChannelModel.find({}).populate(
      'createdBy',
      'name email _id'
    )
    return res.json({
      message: 'Fetched channels',
      channels
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
