"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    avatar: String
}, { timestamps: true });
const GoogleUserModel = (0, mongoose_1.model)('GooglUser', schema);
exports.default = GoogleUserModel;
