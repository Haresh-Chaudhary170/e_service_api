import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import './config/logging';
import 'reflect-metadata';

import { corsHandler } from './middleware/corsHandler';
import { loggingHandler } from './middleware/loggingHandler';
import { routeNotFound } from './middleware/routeNotFound';
import { declareHandler } from './middleware/declareHandler';

import { defineRoutes } from './modules/routes';

import MainController from './controllers/main';
import UserController from './controllers/users';
import AuthController from './controllers/auth';
import CategoryController from './controllers/categories';
import ServiceProviderController from './controllers/calendar';
import ServiceController from './controllers/services';
import ActivityController from './controllers/activityLog';
import CartController from './controllers/carts';
import BookingController from './controllers/bookings';
import ReviewController from './controllers/reviews';
import PaymentController from './controllers/payments';
import NotificationController from './controllers/notifications';

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;
application.use(bodyParser.json());
application.use(cookieParser());
const allowedOrigins = ['http://localhost:3000'];

application.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true, // Allow cookies to be sent
}));


export const Main = async () => {
    logging.log('----------------------------------------');
    logging.log('Initializing API');
    logging.log('----------------------------------------');
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json());


    logging.log('----------------------------------------');
    logging.log('Logging & Configuration');
    logging.log('----------------------------------------');
    application.use(declareHandler);
    application.use(loggingHandler);
    application.use(corsHandler);

    logging.log('----------------------------------------');
    logging.log('Define Controller Routing');
    logging.log('----------------------------------------');
    defineRoutes([
        UserController,
        AuthController,
        MainController,
        CategoryController,
        ServiceProviderController,
        ServiceController,
        ActivityController,
        CartController,
        BookingController,
        ReviewController,
        PaymentController,
        NotificationController
    ], application);

    application.use(routeNotFound);

    logging.log('----------------------------------------');
    logging.log('Starting Server');
    logging.log('----------------------------------------');
    httpServer = http.createServer(application);
    application.listen(process.env.PORT, () => {
        logging.log('----------------------------------------');
        logging.log(`Server started on ${process.env.HOST}:${process.env.PORT}`);
        logging.log('----------------------------------------');
    });
};

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main();
