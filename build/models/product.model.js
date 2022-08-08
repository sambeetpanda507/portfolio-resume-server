"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    img: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    details: {
        type: String,
        required: true
    }
}, { timestamps: true });
const ProductModel = (0, mongoose_1.model)('Product', schema);
exports.default = ProductModel;
