"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shutdown = exports.Main = exports.httpServer = exports.application = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
require("./config/logging");
require("reflect-metadata");
const corsHandler_1 = require("./middleware/corsHandler");
const loggingHandler_1 = require("./middleware/loggingHandler");
const routeNotFound_1 = require("./middleware/routeNotFound");
const declareHandler_1 = require("./middleware/declareHandler");
const routes_1 = require("./modules/routes");
const main_1 = __importDefault(require("./controllers/main"));
const users_1 = __importDefault(require("./controllers/users"));
const auth_1 = __importDefault(require("./controllers/auth"));
const categories_1 = __importDefault(require("./controllers/categories"));
const calendar_1 = __importDefault(require("./controllers/calendar"));
const services_1 = __importDefault(require("./controllers/services"));
const activityLog_1 = __importDefault(require("./controllers/activityLog"));
const carts_1 = __importDefault(require("./controllers/carts"));
const bookings_1 = __importDefault(require("./controllers/bookings"));
const reviews_1 = __importDefault(require("./controllers/reviews"));
const payments_1 = __importDefault(require("./controllers/payments"));
const notifications_1 = __importDefault(require("./controllers/notifications"));
exports.application = (0, express_1.default)();
exports.application.use(body_parser_1.default.json());
exports.application.use((0, cookie_parser_1.default)());
const allowedOrigins = ['http://localhost:3000'];
exports.application.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    credentials: true, // Allow cookies to be sent
}));
const Main = () => __awaiter(void 0, void 0, void 0, function* () {
    logging.log('----------------------------------------');
    logging.log('Initializing API');
    logging.log('----------------------------------------');
    exports.application.use(express_1.default.urlencoded({ extended: true }));
    exports.application.use(express_1.default.json());
    logging.log('----------------------------------------');
    logging.log('Logging & Configuration');
    logging.log('----------------------------------------');
    exports.application.use(declareHandler_1.declareHandler);
    exports.application.use(loggingHandler_1.loggingHandler);
    exports.application.use(corsHandler_1.corsHandler);
    logging.log('----------------------------------------');
    logging.log('Define Controller Routing');
    logging.log('----------------------------------------');
    (0, routes_1.defineRoutes)([
        users_1.default,
        auth_1.default,
        main_1.default,
        categories_1.default,
        calendar_1.default,
        services_1.default,
        activityLog_1.default,
        carts_1.default,
        bookings_1.default,
        reviews_1.default,
        payments_1.default,
        notifications_1.default
    ], exports.application);
    exports.application.use(routeNotFound_1.routeNotFound);
    logging.log('----------------------------------------');
    logging.log('Starting Server');
    logging.log('----------------------------------------');
    exports.httpServer = http_1.default.createServer(exports.application);
    exports.application.listen(process.env.PORT, () => {
        logging.log('----------------------------------------');
        logging.log(`Server started on ${process.env.HOST}:${process.env.PORT}`);
        logging.log('----------------------------------------');
    });
});
exports.Main = Main;
const Shutdown = (callback) => exports.httpServer && exports.httpServer.close(callback);
exports.Shutdown = Shutdown;
(0, exports.Main)();
