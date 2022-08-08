"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    channelName: { required: true, type: String, unique: true },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });
const ChannelModel = (0, mongoose_1.model)('Channel', schema);
exports.default = ChannelModel;
