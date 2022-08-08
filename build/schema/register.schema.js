"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
exports.default = joi_1.default.object().keys({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().email().lowercase().required(),
    avatar: joi_1.default.string().uri(),
    password: joi_1.default.string()
        .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/)
        .required()
        .messages({
        'string.pattern.base': 'Password must be atleast 8 characters long with at least one letter, one number and one special character.'
    })
});
