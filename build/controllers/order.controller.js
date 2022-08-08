"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetails = exports.postVerifyPayment = exports.postStorePaymentData = exports.postRazorpay = exports.getOrders = exports.postPlaceOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const http_errors_1 = require("http-errors");
const schema_1 = require("../schema");
const mongoose_1 = __importDefault(require("mongoose"));
const razorpay_1 = __importDefault(require("razorpay"));
const env_config_1 = require("../config/env.config");
const crypto_1 = __importDefault(require("crypto"));
const payment_model_1 = __importDefault(require("../models/payment.model"));
const postPlaceOrder = async (req, res, next) => {
    try {
        const orderDetails = await schema_1.PlaceOrderSchema.validateAsync(req.body);
        if (mongoose_1.default.Types.ObjectId.isValid(orderDetails.userId) === false)
            throw new http_errors_1.BadRequest('Invalid user id');
        if (mongoose_1.default.Types.ObjectId.isValid(orderDetails.productId) === false)
            throw new http_errors_1.BadRequest('Invalid product id');
        const user = await user_model_1.default.findOne({ _id: orderDetails.userId });
        if (!user)
            throw new http_errors_1.NotFound(`No user with user id ${orderDetails.userId} found`);
        const product = await product_model_1.default.findOne({ _id: orderDetails.productId });
        if (!product)
            throw new http_errors_1.NotFound(`No product with product id ${orderDetails.productId} found`);
        const orderObj = new order_model_1.default(req.body);
        const newOrder = await orderObj.save();
        res.status(201).json({
            message: 'Order placed successfully',
            order: newOrder
        });
    }
    catch (e) {
        console.error('[error] : ', e.message);
        if (e.isJoi === true) {
            e.status = 422;
            e.param = e.details[0].context.label;
        }
        next(e);
    }
};
exports.postPlaceOrder = postPlaceOrder;
const getOrders = async (req, res, next) => {
    try {
        const { id: userId } = await schema_1.IDSchema.validateAsync(req.params);
        if (mongoose_1.default.Types.ObjectId.isValid(userId) === false)
            throw new http_errors_1.BadRequest('Invalid user id');
        const user = await user_model_1.default.findOne({ _id: userId }, { _id: 1 });
        if (!user)
            throw new http_errors_1.NotFound(`user with user id ${userId} not found`);
        const orders = await order_model_1.default.find({ userId: user._id }, { createdAt: 0, updatedAt: 0, __v: 0 }).populate('productId', ['img', 'title', 'mrp', 'price']);
        res.json({
            message: 'Orders fetched successfully',
            orders
        });
    }
    catch (e) {
        console.error('[error] : ', e.message);
        if (e.isJoi === true) {
            e.status = 422;
            e.param = e.details[0].context.label;
        }
        next(e);
    }
};
exports.getOrders = getOrders;
const postRazorpay = async (req, res, next) => {
    try {
        const { amount } = await schema_1.PaymentSchema.validateAsync(req.body);
        const instance = new razorpay_1.default({
            key_id: env_config_1.envConfig.__RZ_PAY_API_KEY__,
            key_secret: env_config_1.envConfig.__RZ_PAY_API_SECRET__
        });
        const orderOpt = {
            amount: amount * 100,
            currency: 'INR',
            receipt: 'order_receipt_id11'
        };
        const paymentRes = await instance.orders.create(orderOpt);
        res.json({ message: 'Successfully created order', orderId: paymentRes.id });
    }
    catch (e) {
        console.error('[error] : ', e.message);
        if (e.isJoi === true) {
            e.status = 422;
            e.param = e.details[0].context.label;
        }
        next(e);
    }
};
exports.postRazorpay = postRazorpay;
const postStorePaymentData = async (req, res, next) => {
    try {
        const instance = new razorpay_1.default({
            key_id: env_config_1.envConfig.__RZ_PAY_API_KEY__,
            key_secret: env_config_1.envConfig.__RZ_PAY_API_SECRET__
        });
        const paymentDetails = await instance.payments.fetch(req.body.paymentId);
        const paymentObj = new payment_model_1.default({
            paymentId: paymentDetails.id,
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            email: paymentDetails.email,
            contact: paymentDetails.contact,
            orders: req.body.cart
        });
        await paymentObj.save();
        res.status(201).json({ message: 'Payment successfull' });
    }
    catch (e) {
        console.error('[error] : ', e.message);
        next(e);
    }
};
exports.postStorePaymentData = postStorePaymentData;
const postVerifyPayment = async (req, res, next) => {
    try {
        const webhookSecret = '490827c0-c570-4888-927e-c554540aff24';
        const shasum = crypto_1.default.createHmac('sha256', webhookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');
        const signatureHeader = req.headers['x-razorpay-signature'];
        if (digest !== signatureHeader)
            throw new http_errors_1.BadGateway();
        res.send({ status: 'ok' });
    }
    catch (e) {
        console.error('[error] : ', e.message);
        next(e);
    }
};
exports.postVerifyPayment = postVerifyPayment;
const getOrderDetails = async (req, res, next) => {
    try {
        const { email } = await schema_1.EmailSchema.validateAsync(req.query);
        const paymentData = await payment_model_1.default.find({ email: email });
        res
            .status(200)
            .json({ message: 'Data fetched successfully', orderDetails: paymentData });
    }
    catch (e) {
        console.error('[error] : ', e.message);
        if (e.isJoi === true) {
            e.status = 422;
            e.param = e.details[0].context.label;
        }
        next(e);
    }
};
exports.getOrderDetails = getOrderDetails;
