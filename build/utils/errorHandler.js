"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, _, res, __) => {
    const status = err.status || 500;
    const message = err.message;
    const payload = err.param
        ? {
            error: {
                status,
                message,
                param: err.param
            }
        }
        : {
            error: {
                status,
                message
            }
        };
    res.status(status).send(payload);
};
exports.default = errorHandler;
