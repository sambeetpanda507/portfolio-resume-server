"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDb = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = require("../config/env.config");
const connectToDb = async () => {
    try {
        const dbURI = env_config_1.envConfig.__NODE_ENV__ === 'production'
            ? env_config_1.envConfig.__DB_URI_PROD__
            : env_config_1.envConfig.__DB_URI_DEV__;
        await mongoose_1.default.connect(dbURI);
        console.info('[info] : connected to database');
    }
    catch (e) {
        console.log(e.message);
        process.exit(1);
    }
};
exports.connectToDb = connectToDb;
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    console.log('[info] : ', 'mongoose disconnected');
    process.exit(0);
});
