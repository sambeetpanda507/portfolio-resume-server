"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const chatRouter = express_1.default.Router();
chatRouter.post('/create-channel', auth_middleware_1.isAuthenticated, chat_controller_1.postCreateChannel);
chatRouter.get('/get-channels', auth_middleware_1.isAuthenticated, chat_controller_1.getAllChannels);
exports.default = chatRouter;
