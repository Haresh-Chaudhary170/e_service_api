import { Request, Response, NextFunction } from 'express';
import bcrypt from "bcryptjs";
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Bitmoro } from 'bitmoro';


import { PrismaClient } from "@prisma/client";
import { OtpService } from '../services/otpService';
import { EmailService } from '../services/emailService';
import otpEmailTemplate from '../templates/email_templates';
import { logActivity } from '../library/activityLogger';
const prisma = new PrismaClient();

type BitmoroOtpResponse = {
    numberOfFailed: number;
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const userValidationSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
const emailValidationSchema = z.object({
    email: z.string().email("Invalid email format"),
});
@Controller('/api')
class AuthController {

    @Route('post', '/login')
    @Validate(userValidationSchema) // Validation on the request body
    async login(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        let customerId = null;
        let providerId = null;


        try {
            // Check if the user exists
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Validate the password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: "Email or password is incorret!" });
            }

            // Generate a token
            if (!JWT_SECRET) {
                return res.status(500).json({ error: "JWT_SECRET is not defined" });
            }
            if (user.role === "CUSTOMER") {
                const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
                customerId = customer?.id;
            }
            else if (user.role === "SERVICE_PROVIDER") {
                const provider = await prisma.serviceProvider.findUnique({ where: { userId: user.id } });
                providerId = provider?.id;
            }
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role, customerId: customerId, providerId: providerId }, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN,
            });

            // Set the token as a cookie with HttpOnly, Secure, and SameSite flags
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "PRODUCTION",
                sameSite: "lax",
                maxAge: 60 * 60 * 1000,
                path: "/",
            });


            // Respond with a success message and user data (optional)
            return res.json({
                message: "Login successful",
                user: { firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
            });

        } catch (error) {
            return res.status(500).json({ error: "Error logging in" });
        }
    }

    @Route('post', '/logout')
    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Clear the token cookie
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "PRODUCTION",
                sameSite: "strict",
            });

            // Respond with a success message
            res.status(200).json({ message: "Logout successful" });
        } catch (error) {
            console.error("Error during logout:", error);
            res.status(500).json({ error: "Error logging out" });
        }
    }

    // send otp
    @Route('post', '/send-otp-email')
    @Validate(emailValidationSchema)
    async sendOtpEmail(req: Request, res: Response, next: NextFunction) {
        const otpService = new OtpService();
        const otp = otpService.generateOtp();
        console.log(`Generated OTP is: ${otp}`);

        const emailService = new EmailService();

        try {
            const { email } = req.body;

            // Check if user exists
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(400).json({ error: 'User with the provided email does not exists!' });
            }
            const otpType = 'EMAIL';

            // Save OTP to database
            await prisma.oTP.create({
                data: {
                    userId: user.id,
                    otp: otp,
                    type: otpType,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
                }
            });

            const userName = user.firstName;
            const emailSent = await emailService.sendEmail(
                user.email,
                'Email Verification',
                'This email with otp is sent to you to verify your email. If this action is not initiated by you then please ignore it.',
                otpEmailTemplate(otp, userName)
            );
            if (emailSent) {
                res.status(200).json({
                    userId: user.id,
                    message: 'OTP sent successfully. Please check your email.'
                })
            } else {
                res.status(500).json({ error: 'Error sending email' });

            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error sending OTP' });
        }
    }

    // verify email
    @Route('post', '/verify-email')
    async verifyEmailOtp(req: Request, res: Response, next: NextFunction) {
        const { userId, otp } = req.body;
        const otpService = new OtpService();
        try {
            const isVerified = await otpService.verifyOtp(userId, otp, "EMAIL");
            if (isVerified) {
                // Update user's emailVerified status
                const user = await prisma.user.update({
                    where: { id: userId },
                    data: { emailVerified: true }
                });
                await logActivity({
                    userId,
                    action: 'Email verified',
                    entity: 'User',
                    entityId: userId,
                    details: { email: user.email },
                    req
                })
                res.status(200).json({ message: 'Email verified successfully' });
            } else {
                res.status(400).json({ error: 'Invalid OTP or OTP expired' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error verifying Email.' });

        }
    }

    // send otp to phone
    @Route('post', '/send-otp-phone')
    // @Validate(emailValidationSchema)
    async sendOtpPhone(req: Request, res: Response, next: NextFunction) {
        const apiKey = process.env.BITMORO_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "BITMORO_API_KEY is not defined" });
        }
        const otpLength = 6;
        const expiryTime = 10; // OTP valid for 10 minutes
        const bitmoro = new Bitmoro(apiKey);
        const OtpHandler = bitmoro.getOtpHandler(expiryTime, otpLength)
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ error: 'Invalid phone number' });
        }
        // check if phone exist
        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
            return res.status(400).json({ error: 'User with the provided phone number does not exists!' });
        }
        const otp = OtpHandler.registerOtp(user.id);
        const otpMessage = `Your OTP for EService phone verification is ${otp.otp}`
        const response = await OtpHandler.sendOtpMessage(phone, otpMessage, "BIT_MORE") as unknown as BitmoroOtpResponse;
        console.log(response, user.id);
        if (response.numberOfFailed == 0) {
            // Save OTP to database
            await prisma.oTP.create({
                data: {
                    userId: user.id,
                    otp: otp.otp,
                    type: 'PHONE',
                    expiresAt: new Date(Date.now() + expiryTime * 60 * 1000),
                }
            });
            res.status(200).json({
                userId: user.id,
                message: 'OTP sent successfully. Please check your phone.'
            })
        }
        else {
            res.status(500).json({ error: 'Error sending OTP' });

        }

    }

    // verify phone otp
    @Route('post', '/verify-phone')
    async verifyPhone(req: Request, res: Response, next: NextFunction) {
        const { userId, otp } = req.body;
        const otpService = new OtpService();
        try {
            const isVerified = await otpService.verifyPhoneOtp(userId, otp);
            if (isVerified) {
                // Update user's phoneVerified status
                const user = await prisma.user.update({
                    where: { id: userId },
                    data: { phoneVerified: true }
                });
                await logActivity({
                    userId,
                    action: 'Phone verified',
                    entity: 'User',
                    entityId: userId,
                    details: { phone: user.phone },
                    req
                })
                res.status(200).json({ message: 'Phone verified successfully' });
            } else {
                res.status(400).json({ error: 'Invalid OTP or OTP expired' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error verifying Phone.' });

        }
    }
}

export default AuthController;
