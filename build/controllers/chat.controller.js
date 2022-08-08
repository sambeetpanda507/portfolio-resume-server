"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChannels = exports.postCreateChannel = void 0;
const channel_model_1 = __importDefault(require("../models/channel.model"));
const postCreateChannel = async (req, res) => {
    try {
        const { channelName, createdBy } = req.body;
        const isChannelExist = await channel_model_1.default.findOne({ channelName });
        if (isChannelExist) {
            return res.status(400).json({ message: 'Channel already exist.' });
        }
        const channel = new channel_model_1.default({
            channelName,
            createdBy
        });
        const result = await channel.save();
        console.log(result);
        return res.status(201).json({
            message: 'Channel created successfully.',
            details: result
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.postCreateChannel = postCreateChannel;
const getAllChannels = async (req, res) => {
    try {
        console.log('ip : ', req.ip);
        const channels = await channel_model_1.default.find({}).populate('createdBy', 'name email _id');
        return res.json({
            message: 'Fetched channels',
            channels
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllChannels = getAllChannels;
