"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const activityLogger_1 = require("../library/activityLogger");
const axios_1 = __importDefault(require("axios")); // Use axios for HTTP requests
const prisma = new client_1.PrismaClient();
let PaymentController = class PaymentController {
    // Add service area
    initiate(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookingId, totalAmount, serviceName } = req.body;
            const customerInfo = {
                name: req.user.firstName + " " + req.user.lastName,
                email: req.user.email,
                phone: req.user.phone,
            };
            // Validate that all necessary fields are present
            if (!bookingId || !totalAmount || !serviceName) {
                return res.status(400).json({ error: 'Missing required fields.' });
            }
            // check if booking exists
            const booking = yield prisma.booking.findUnique({ where: { id: bookingId } });
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found.' });
            }
            // check if booking id already in payment
            const existingPayment = yield prisma.payment.findFirst({ where: { bookingId, status: "COMPLETED" } });
            if (existingPayment) {
                return res.status(400).json({ error: 'Payment for this booking already completed.' });
            }
            // Check if the total amount is valid
            if (totalAmount <= 0) {
                return res.status(400).json({ error: 'Invalid total amount.' });
            }
            // Initiate payment using Khalti API
            // Replace 'https://dev.khalti.com/api/v2/epayment/initiate/' with the actual Khalti API endpoint URL
            try {
                const response = yield axios_1.default.post('https://khalti.com/api/v2/epayment/initiate/', {
                    return_url: `${process.env.FRONTEND_URL}/payment/processing`,
                    website_url: process.env.FRONTEND_URL,
                    amount: totalAmount * 100,
                    purchase_order_id: bookingId,
                    purchase_order_name: serviceName,
                    customer_info: {
                        name: customerInfo.name,
                        email: customerInfo.email,
                        phone: customerInfo.phone,
                    }
                }, {
                    headers: {
                        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                        'Content-Type': 'application/json',
                    }
                });
                // log activity
                yield (0, activityLogger_1.logActivity)({
                    userId: req.user.id,
                    action: 'Initiated payment via Khalti',
                    entity: 'booking',
                    entityId: bookingId,
                    details: {
                        totalAmount,
                        serviceName,
                        paymentGateway: 'Khalti',
                    },
                    req,
                });
                // Return payment details to the client
                // Uncomment this if you want to return payment details to the client
                // Replace 'https://dev.khalti.com/api/v2/epayment/details/' with the actual Khalti API endpoint URL
                // const paymentDetailsResponse = await axios.get(`https://khalti.com/api/v2/epayment/details/${transactionId}`, {
                //     headers: {
                //         'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                //         'Content-Type': 'application/json',
                //     }
                // });
                return res.status(200).json(response.data);
                // redirect it to payment url
                // res.redirect (response.data.payment_url)
            }
            catch (error) {
                console.error('Error initiating payment:', error);
                return res.status(500).json({ error: 'Failed to initiate payment.' });
            }
        });
    }
    // verify khalti
    verify(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookingId, transactionId, amount, status } = req.body;
            // Validate that all necessary fields are present
            if (!bookingId || !transactionId || !amount || !status) {
                return res.status(400).json({ error: 'Missing required fields.' });
            }
            // check if booking exists
            const booking = yield prisma.booking.findUnique({ where: { id: bookingId } });
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found.' });
            }
            // check if booking id already in payment
            const existingPayment = yield prisma.payment.findFirst({ where: { bookingId, status: "COMPLETED" } });
            if (existingPayment) {
                return res.status(400).json({ error: 'Payment for this booking already completed.' });
            }
            // Check if the total amount is valid
            if (amount <= 0) {
                return res.status(400).json({ error: 'Invalid total amount.' });
            }
            // update or insert  payment with booking id
            const payment = yield prisma.payment.create({
                data: {
                    bookingId,
                    transactionId,
                    amount: parseFloat(amount) / 100,
                    status: status.toUpperCase(),
                    method: 'KHALTI',
                    metadata: {
                        transaction_status: status,
                        transaction_id: transactionId,
                    },
                    paymentDate: new Date(),
                    retryCount: 1
                },
            });
            // change status of booking
            yield prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'IN_PROGRESS' },
            });
            // Log activity
            yield (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: 'Payment Processed',
                entity: 'payment',
                entityId: payment.id,
                details: { payment, bookingId },
                req,
            });
            return res.status(200).json({ message: 'Payment successful.' });
        });
    }
    // handle cash on delivery
    handleCashOnDelivery(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookingId, totalAmount } = req.body;
            // Validate that all necessary fields are present
            if (!bookingId || !totalAmount) {
                return res.status(400).json({ error: 'Missing required fields.' });
            }
            // check if booking exists
            const booking = yield prisma.booking.findUnique({ where: { id: bookingId } });
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found.' });
            }
            // check if booking id already in payment
            const existingPayment = yield prisma.payment.findFirst({ where: { bookingId, status: "COMPLETED" } });
            if (existingPayment) {
                return res.status(400).json({ error: 'Payment for this booking already completed.' });
            }
            // Check if the total amount is valid
            if (totalAmount <= 0) {
                return res.status(400).json({ error: 'Invalid total amount.' });
            }
            // update or insert  payment with booking id
            const payment = yield prisma.payment.create({
                data: {
                    bookingId,
                    amount: parseFloat(totalAmount),
                    status: "PENDING",
                    method: 'CASH_ON_DELIVERY',
                    paymentDate: new Date(),
                    retryCount: 1
                },
            });
            // change status of booking
            yield prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'IN_PROGRESS' },
            });
            // Log activity
            yield (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: 'Order Placed with COD',
                entity: 'payment',
                entityId: payment.id,
                details: { payment, bookingId },
                req,
            });
        });
    }
};
__decorate([
    (0, route_1.Route)('post', '/khalti/initiate', (0, authMiddleware_1.checkRole)(['CUSTOMER']))
    // @Validate(serviceAreaSchema)  // Uncomment this if you want to validate incoming request body
], PaymentController.prototype, "initiate", null);
__decorate([
    (0, route_1.Route)('post', '/khalti/verify', (0, authMiddleware_1.checkRole)(['CUSTOMER']))
], PaymentController.prototype, "verify", null);
__decorate([
    (0, route_1.Route)('post', '/cod', (0, authMiddleware_1.checkRole)(['CUSTOMER']))
], PaymentController.prototype, "handleCashOnDelivery", null);
PaymentController = __decorate([
    (0, controller_1.Controller)('/api/payment')
], PaymentController);
exports.default = PaymentController;
