"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
exports.default = joi_1.default.object().keys({
    img: joi_1.default.string().required(),
    title: joi_1.default.string().required(),
    mrp: joi_1.default.number().required(),
    price: joi_1.default.number().required(),
    details: joi_1.default.string().required()
});
