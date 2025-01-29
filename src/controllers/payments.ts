import { Request, Response, NextFunction } from 'express';
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import { PaymentStatus, PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';
import { logActivity } from '../library/activityLogger';
import axios from 'axios';  // Use axios for HTTP requests
const prisma = new PrismaClient();

@Controller('/api/payment')
class PaymentController {
    // Add service area
    @Route('post', '/khalti/initiate', checkRole(['CUSTOMER']))
    // @Validate(serviceAreaSchema)  // Uncomment this if you want to validate incoming request body
    async initiate(req: Request, res: Response, next: NextFunction) {
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
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        // check if booking id already in payment
        const existingPayment = await prisma.payment.findFirst({ where: { bookingId, status: "COMPLETED" } });
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
            const response = await axios.post('https://khalti.com/api/v2/epayment/initiate/', {
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
            await logActivity({
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
        } catch (error) {
            console.error('Error initiating payment:', error);
            return res.status(500).json({ error: 'Failed to initiate payment.' });
        }
    }

    // verify khalti
    @Route('post', '/khalti/verify', checkRole(['CUSTOMER']))
    async verify(req: Request, res: Response, next: NextFunction) {
        const { bookingId, transactionId, amount, status } = req.body;

        // Validate that all necessary fields are present
        if (!bookingId || !transactionId || !amount || !status) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // check if booking exists
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        // check if booking id already in payment
        const existingPayment = await prisma.payment.findFirst({ where: { bookingId, status: "COMPLETED" } });
        if (existingPayment) {
            return res.status(400).json({ error: 'Payment for this booking already completed.' });
        }


        // Check if the total amount is valid
        if (amount <= 0) {
            return res.status(400).json({ error: 'Invalid total amount.' });
        }

        // update or insert  payment with booking id
        const payment = await prisma.payment.create({
            data: {
                bookingId,
                transactionId,
                amount: parseFloat(amount) / 100,
                status: status.toUpperCase() as PaymentStatus,
                method: 'KHALTI',
                metadata: {
                    transaction_status: status,
                    transaction_id: transactionId,
                },
                paymentDate: new Date(),
                retryCount: 1
            },
        });

        // Log activity
        await logActivity({
            userId: req.user.id,
            action: 'Payment Processed',
            entity: 'payment',
            entityId: payment.id,
            details: { payment, bookingId },
            req,
        });

        return res.status(200).json({ message: 'Payment successful.' });
    }
}

export default PaymentController;
