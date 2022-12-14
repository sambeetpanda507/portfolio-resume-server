"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const product_controller_1 = require("../controllers/product.controller");
const productRouter = (0, express_1.Router)();
productRouter.post('/save-product', auth_middleware_1.isAuthenticated, product_controller_1.postSaveProduct);
productRouter.get('/get-products', product_controller_1.getProducts);
productRouter.get('/get-product/:id', product_controller_1.getProduct);
productRouter.delete('/delete-product', auth_middleware_1.isAuthenticated, product_controller_1.deleteProduct);
exports.default = productRouter;
