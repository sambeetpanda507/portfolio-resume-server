"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.getProduct = exports.postSaveProduct = exports.getProducts = void 0;
const product_model_1 = __importDefault(require("../models/product.model"));
const schema_1 = require("../schema");
const http_errors_1 = require("http-errors");
const mongoose_1 = __importDefault(require("mongoose"));
const getProducts = async (_, res, next) => {
    try {
        const products = await product_model_1.default.find({});
        res.status(200).json({
            message: 'Proucts fetched successfully',
            products
        });
    }
    catch (e) {
        console.log('[error] : ', e.message);
        next(e);
    }
};
exports.getProducts = getProducts;
const postSaveProduct = async (req, res, next) => {
    try {
        const { img, title, details, price, mrp } = await schema_1.ProductSchema.validateAsync(req.body);
        const productObj = new product_model_1.default({
            img,
            title,
            details,
            price,
            mrp
        });
        const savedProduct = await productObj.save();
        res.status(201).json({
            message: 'Product saved successfully',
            product: savedProduct
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
exports.postSaveProduct = postSaveProduct;
const getProduct = async (req, res, next) => {
    try {
        const { id } = await schema_1.IDSchema.validateAsync(req.params);
        if (mongoose_1.default.Types.ObjectId.isValid(id) === false)
            throw new http_errors_1.BadRequest('Invalid product id');
        const product = await product_model_1.default.findOne({ _id: id });
        if (!product)
            throw new http_errors_1.NotFound(`Product with product id ${id} not found`);
        res.json({
            message: 'Product found',
            product
        });
    }
    catch (e) {
        console.error(e.message);
        next(e);
    }
};
exports.getProduct = getProduct;
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = await schema_1.IDSchema.validateAsync(req.params);
        if (mongoose_1.default.Types.ObjectId.isValid(id) === false)
            throw new http_errors_1.BadRequest('Invalid product id');
        const product = await product_model_1.default.findOne({ _id: id });
        if (!product)
            throw new http_errors_1.NotFound(`Product with product id ${id} not found`);
        await product_model_1.default.deleteOne({ _id: id });
        res.json({
            message: 'Product deleted successfully',
            productId: id
        });
    }
    catch (e) {
        console.error(e.message);
        next(e);
    }
};
exports.deleteProduct = deleteProduct;
