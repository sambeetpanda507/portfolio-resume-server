"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.envConfig = {
    __NODE_ENV__: process.env.NODE_ENV,
    __PORT__: process.env.PORT,
    __DB_URI_PROD__: process.env.DB_URI_PROD,
    __DB_URI_DEV__: process.env.DB_URI_DEV,
    __COOKIE_SECRET__: process.env.COOKIE_SECRET,
    __JWT_REFRESH_SECRET__: process.env.JWT_REFRESH_SECRET,
    __JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    __CLIENT_URI__: process.env.CLIENT_URI,
    __REDIS_PASSWORD__: process.env.REDIS_PASSWORD,
    __REDIS_URI__: process.env.REDIS_URI,
    __RZ_PAY_API_KEY__: process.env.RZ_PAY_API_KEY,
    __RZ_PAY_API_SECRET__: process.env.RZ_PAY_API_SECRET
};
