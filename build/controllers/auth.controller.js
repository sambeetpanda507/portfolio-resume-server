"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGoogleLogin = exports.getLogout = exports.getUserData = exports.getAccessToken = exports.postLoginUser = exports.postRegisterUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../models/user.model"));
const googlUser_model_1 = __importDefault(require("../models/googlUser.model"));
const token_1 = require("../utils/token");
const jsonwebtoken_1 = require("jsonwebtoken");
const env_config_1 = require("../config/env.config");
const http_errors_1 = require("http-errors");
const schema_1 = require("../schema");
const redis_1 = require("../utils/redis");
const postRegisterUser = async (req, res, next) => {
    try {
        const { name, email, avatar, password } = await schema_1.RegisterSchema.validateAsync(req.body);
        const user = await user_model_1.default.findOne({ email: email });
        if (user)
            throw new http_errors_1.Conflict('User already exist.');
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        if (!hashedPassword)
            throw new http_errors_1.InternalServerError('Oops some error occured');
        const userData = new user_model_1.default({
            name,
            email,
            password: hashedPassword,
            avatar
        });
        const createdUser = await userData.save();
        res.status(201).json({
            message: 'Registration successfull',
            userData: {
                userId: createdUser.id,
                name,
                email,
                avatar
            }
        });
    }
    catch (e) {
        console.log('[error] : ', e.message);
        if (e.isJoi === true) {
            e.status = 422;
            e.param = e.details[0].context.label;
        }
        next(e);
    }
};
exports.postRegisterUser = postRegisterUser;
const postLoginUser = async (req, res, next) => {
    try {
        const { email, password } = await schema_1.LoginSchema.validateAsync(req.body);
        const user = await user_model_1.default.findOne({ email: email });
        if (!user)
            throw new http_errors_1.NotFound('User not registered.');
        const isValidPass = await bcrypt_1.default.compare(password, user.password);
        if (isValidPass === false)
            throw new http_errors_1.Unauthorized('Invalid email or password');
        await (0, token_1.createRefreshToken)(res, user);
        const accessToken = (0, token_1.createAccessToken)(user);
        res.status(200).json({
            message: 'Login successfull',
            auth: true,
            userData: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                accessToken
            }
        });
    }
    catch (e) {
        console.log('[error] : ', e.message);
        if (e.isJoi === true)
            next(new http_errors_1.BadRequest('Invalid email or password'));
        else
            next(e);
    }
};
exports.postLoginUser = postLoginUser;
const getAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken)
            throw new http_errors_1.Unauthorized();
        let payload = null;
        try {
            payload = (0, jsonwebtoken_1.verify)(refreshToken, env_config_1.envConfig.__JWT_REFRESH_SECRET__);
        }
        catch (e) {
            console.error('[error]: ', e.message);
            throw new http_errors_1.Unauthorized();
        }
        const { userId } = payload;
        const redisRefToken = await redis_1.redisClient.get(userId);
        if (!redisRefToken)
            throw new http_errors_1.Unauthorized();
        const user = await user_model_1.default.findOne({ _id: userId });
        const googleUser = await googlUser_model_1.default.findOne({ _id: userId });
        if (!user && !googleUser)
            throw new http_errors_1.Unauthorized();
        let accessToken = '';
        if (user) {
            await (0, token_1.createRefreshToken)(res, user);
            accessToken = (0, token_1.createAccessToken)(user);
            res.status(200).json({
                message: 'New access token',
                auth: true,
                userData: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    accessToken
                }
            });
        }
        else if (googleUser) {
            await (0, token_1.createRefreshTokenForGoogle)(res, googleUser);
            accessToken = (0, token_1.createAccessTokenForGoogle)(googleUser);
            res.status(200).json({
                message: 'New access token',
                auth: true,
                userData: {
                    userId: googleUser.id,
                    name: googleUser.name,
                    email: googleUser.email,
                    avatar: googleUser.avatar,
                    accessToken
                }
            });
        }
    }
    catch (e) {
        console.error('[error] : ', e.message);
        next(e);
    }
};
exports.getAccessToken = getAccessToken;
const getUserData = async (req, res, next) => {
    try {
        if (req.userId === null)
            throw new http_errors_1.Unauthorized();
        const user = await user_model_1.default.findOne({ _id: req.userId });
        if (!user)
            throw new http_errors_1.NotFound('User not registered.');
        res.json({
            message: 'Ok',
            userData: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });
    }
    catch (e) {
        console.error('[error] : ', e.message);
        next(e);
    }
};
exports.getUserData = getUserData;
const getLogout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken)
            throw new http_errors_1.BadRequest();
        let payload = null;
        try {
            payload = (0, jsonwebtoken_1.verify)(refreshToken, env_config_1.envConfig.__JWT_REFRESH_SECRET__);
        }
        catch (e) {
            console.error('[error]: ', e.message);
            throw new http_errors_1.Unauthorized();
        }
        const { userId } = payload;
        await redis_1.redisClient.del(userId);
        res
            .clearCookie('refresh_token', {
            httpOnly: true,
            sameSite: env_config_1.envConfig.__NODE_ENV__ === 'production' ? 'none' : 'strict',
            secure: env_config_1.envConfig.__NODE_ENV__ === 'production'
        })
            .json({
            message: 'Successfully logged out',
            auth: false,
            accessToken: null
        });
    }
    catch (e) {
        console.error('[error] : ', e.message);
        next(e);
    }
};
exports.getLogout = getLogout;
const postGoogleLogin = async (req, res, next) => {
    try {
        const { name, email, avatar } = await schema_1.GoogleLoginSchema.validateAsync(req.body);
        const user = await googlUser_model_1.default.findOne({ email: email });
        if (user) {
            await (0, token_1.createRefreshTokenForGoogle)(res, user);
            const accessToken = (0, token_1.createAccessTokenForGoogle)(user);
            res.json({
                message: 'Login Successfull',
                auth: true,
                userData: {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    accessToken
                }
            });
        }
        else {
            const newUser = new googlUser_model_1.default({
                name,
                email,
                avatar
            });
            const savedUser = await newUser.save();
            const accessToken = (0, token_1.createAccessTokenForGoogle)(savedUser);
            await (0, token_1.createRefreshTokenForGoogle)(res, savedUser);
            res.json({
                message: 'Login Successfull',
                auth: true,
                userData: {
                    userId: savedUser.id,
                    name: savedUser.name,
                    email: savedUser.email,
                    avatar: savedUser.avatar,
                    accessToken
                }
            });
        }
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
exports.postGoogleLogin = postGoogleLogin;
