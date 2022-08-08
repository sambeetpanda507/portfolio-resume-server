"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConntect = exports.redisClient = void 0;
const redis_1 = require("redis");
const env_config_1 = require("../config/env.config");
const connectionStr = `redis://default:${env_config_1.envConfig.__REDIS_PASSWORD__}@${env_config_1.envConfig.__REDIS_URI__}`;
exports.redisClient = (0, redis_1.createClient)({
    url: connectionStr
});
const redisConntect = async () => {
    try {
        await exports.redisClient.connect();
    }
    catch (e) {
        console.error(e.message);
        process.exit(1);
    }
};
exports.redisConntect = redisConntect;
exports.redisClient.on('ready', () => {
    console.log('[info] : connected to redis');
});
process.on('SIGINT', async () => {
    await exports.redisClient.disconnect();
    console.log('[info] : ', 'redis disconnected');
});
