"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
exports.default = joi_1.default.object().keys({
    amount: joi_1.default.number().required(),
    userId: joi_1.default.string().required(),
    productId: joi_1.default.string().required(),
    quantity: joi_1.default.number().required()
});
