"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const env_config_1 = require("./config/env.config");
const db_1 = require("./utils/db");
const http_errors_1 = require("http-errors");
const redis_1 = require("./utils/redis");
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const chat_router_1 = __importDefault(require("./routers/chat.router"));
const errorHandler_1 = __importDefault(require("./utils/errorHandler"));
const product_router_1 = __importDefault(require("./routers/product.router"));
const order_router_1 = __importDefault(require("./routers/order.router"));
const fs_1 = __importDefault(require("fs"));
const main = async () => {
    const app = (0, express_1.default)();
    const httpServer = (0, http_1.createServer)(app);
    const corsOptions = {
        origin: [env_config_1.envConfig.__CLIENT_URI__, 'http://localhost:4000'],
        credentials: true
    };
    const viewsPath = path_1.default.join(__dirname, 'views');
    const morganFormat = env_config_1.envConfig.__NODE_ENV__ === 'development' ? 'dev' : 'combined';
    app.use((0, morgan_1.default)(morganFormat));
    app.use((0, cors_1.default)(corsOptions));
    app.use((0, cookie_parser_1.default)(env_config_1.envConfig.__COOKIE_SECRET__));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
    app.set('view engine', 'ejs');
    app.set('views', viewsPath);
    await Promise.all([(0, db_1.connectToDb)(), (0, redis_1.redisConntect)()]);
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: [env_config_1.envConfig.__CLIENT_URI__]
        }
    });
    let onlineUsers = {};
    io.of('/socket').on('connection', (socket) => {
        console.log('[info] : ', 'socket io client count: ', io.engine.clientsCount);
        socket.emit('connection', {
            message: 'connected to server',
            socketId: socket.id
        });
        socket.on('disconnect', (reason) => {
            console.log(`user (${socket.id}) disconnected: `, reason);
            const clientCount = io.engine.clientsCount;
            console.log('[info] : ', 'socket io client count: ', clientCount);
            for (let u in onlineUsers) {
                if (onlineUsers[u].socketId === socket.id) {
                    delete onlineUsers[u];
                }
            }
            io.of('/socket').emit('NEW_USER', onlineUsers);
        });
        socket.on('NEW_USER', ({ email, name, avatar }) => {
            console.log('[info] :', 'new user connected: ', email);
            onlineUsers[email] = { socketId: socket.id, name, avatar };
            io.of('/socket').emit('NEW_USER', onlineUsers);
        });
        socket.on('NEW_MSG', (newMsg) => {
            const type = newMsg.type === 'IN' ? 'OUT' : 'IN';
            const socketId = onlineUsers[newMsg.receiver].socketId;
            const updatedMsg = {
                ...newMsg,
                type
            };
            io.of('/socket').to(socketId).emit('NEW_MSG', updatedMsg);
        });
    });
    app.get('/', (_, res) => {
        res.render('index');
    });
    app.use('/auth', auth_router_1.default);
    app.use('/api', chat_router_1.default);
    app.use('/api', product_router_1.default);
    app.use('/api', order_router_1.default);
    app.get('/api/download-resume', (_, res) => {
        const filePath = path_1.default.join(__dirname, '../', 'resume.pdf');
        const fileName = path_1.default.basename(filePath);
        const mimeType = 'application/pdf';
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', mimeType);
        const fileStream = fs_1.default.createReadStream(filePath);
        fileStream.pipe(res);
    });
    app.use((_, __, next) => {
        next(new http_errors_1.NotFound('Page not found'));
    });
    app.use(errorHandler_1.default);
    httpServer.listen(env_config_1.envConfig.__PORT__, () => {
        console.log(`[info] : server is listening on port: ${env_config_1.envConfig.__PORT__}`);
    });
};
main().catch((error) => console.error('[error]: ', error.message));
