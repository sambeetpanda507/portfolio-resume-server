"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    paymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    orders: [{ title: String, count: Number, mrp: Number, price: Number }]
}, { timestamps: true });
const PaymentModel = (0, mongoose_1.model)('payment', schema);
exports.default = PaymentModel;
