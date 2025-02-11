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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const validator_1 = require("../decorators/validator");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bitmoro_1 = require("bitmoro");
const client_1 = require("@prisma/client");
const otpService_1 = require("../services/otpService");
const emailService_1 = require("../services/emailService");
const email_templates_1 = __importDefault(require("../templates/email_templates"));
const activityLogger_1 = require("../library/activityLogger");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const userValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
const emailValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
});
let AuthController = class AuthController {
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                // Check if the user exists
                const user = yield prisma.user.findUnique({ where: { email } });
                if (!user) {
                    return res.status(404).json({ error: "User not found" });
                }
                // Validate the password
                const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ error: "Email or password is incorret!" });
                }
                // Generate a token
                if (!JWT_SECRET) {
                    return res.status(500).json({ error: "JWT_SECRET is not defined" });
                }
                const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
                    expiresIn: JWT_EXPIRES_IN,
                });
                // Set the token as a cookie with HttpOnly, Secure, and SameSite flags
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "PRODUCTION",
                    sameSite: "strict", // Adjust as needed
                    maxAge: 60 * 60 * 1000, // 1 hour
                });
                // Respond with a success message and user data (optional)
                return res.json({
                    message: "Login successful",
                    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
                });
            }
            catch (error) {
                return res.status(500).json({ error: "Error logging in" });
            }
        });
    }
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Clear the token cookie
                res.clearCookie("token", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "PRODUCTION",
                    sameSite: "strict",
                });
                // Respond with a success message
                res.status(200).json({ message: "Logout successful" });
            }
            catch (error) {
                console.error("Error during logout:", error);
                res.status(500).json({ error: "Error logging out" });
            }
        });
    }
    // send otp
    sendOtpEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpService = new otpService_1.OtpService();
            const otp = otpService.generateOtp();
            console.log(`Generated OTP is: ${otp}`);
            const emailService = new emailService_1.EmailService();
            try {
                const { email } = req.body;
                // Check if user exists
                const user = yield prisma.user.findUnique({ where: { email } });
                if (!user) {
                    return res.status(400).json({ error: 'User with the provided email does not exists!' });
                }
                const otpType = 'EMAIL';
                // Save OTP to database
                yield prisma.oTP.create({
                    data: {
                        userId: user.id,
                        otp: otp,
                        type: otpType,
                        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 minutes
                    }
                });
                const userName = user.firstName;
                const emailSent = yield emailService.sendEmail(user.email, 'Email Verification', 'This email with otp is sent to you to verify your email. If this action is not initiated by you then please ignore it.', (0, email_templates_1.default)(otp, userName));
                if (emailSent) {
                    res.status(200).json({
                        userId: user.id,
                        message: 'OTP sent successfully. Please check your email.'
                    });
                }
                else {
                    res.status(500).json({ error: 'Error sending email' });
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error sending OTP' });
            }
        });
    }
    // verify email
    verifyEmailOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, otp } = req.body;
            const otpService = new otpService_1.OtpService();
            try {
                const isVerified = yield otpService.verifyOtp(userId, otp, "EMAIL");
                if (isVerified) {
                    // Update user's emailVerified status
                    const user = yield prisma.user.update({
                        where: { id: userId },
                        data: { emailVerified: true }
                    });
                    yield (0, activityLogger_1.logActivity)({
                        userId,
                        action: 'Email verified',
                        entity: 'User',
                        entityId: userId,
                        details: { email: user.email },
                        req
                    });
                    res.status(200).json({ message: 'Email verified successfully' });
                }
                else {
                    res.status(400).json({ error: 'Invalid OTP or OTP expired' });
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error verifying Email.' });
            }
        });
    }
    // send otp to phone
    sendOtpPhone(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = process.env.BITMORO_API_KEY;
            if (!apiKey) {
                return res.status(500).json({ error: "BITMORO_API_KEY is not defined" });
            }
            const otpLength = 6;
            const expiryTime = 10; // OTP valid for 10 minutes
            const bitmoro = new bitmoro_1.Bitmoro(apiKey);
            const OtpHandler = bitmoro.getOtpHandler(expiryTime, otpLength);
            const { phone } = req.body;
            if (!phone) {
                return res.status(400).json({ error: 'Invalid phone number' });
            }
            // check if phone exist
            const user = yield prisma.user.findUnique({ where: { phone } });
            if (!user) {
                return res.status(400).json({ error: 'User with the provided phone number does not exists!' });
            }
            const otp = OtpHandler.registerOtp(user.id);
            const otpMessage = `Your OTP for EService phone verification is ${otp.otp}`;
            const response = yield OtpHandler.sendOtpMessage(phone, otpMessage, "BIT_MORE");
            console.log(response, user.id);
            if (response.numberOfFailed == 0) {
                // Save OTP to database
                yield prisma.oTP.create({
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
                });
            }
            else {
                res.status(500).json({ error: 'Error sending OTP' });
            }
        });
    }
    // verify phone otp
    verifyPhone(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, otp } = req.body;
            const otpService = new otpService_1.OtpService();
            try {
                const isVerified = yield otpService.verifyPhoneOtp(userId, otp);
                if (isVerified) {
                    // Update user's phoneVerified status
                    const user = yield prisma.user.update({
                        where: { id: userId },
                        data: { phoneVerified: true }
                    });
                    yield (0, activityLogger_1.logActivity)({
                        userId,
                        action: 'Phone verified',
                        entity: 'User',
                        entityId: userId,
                        details: { phone: user.phone },
                        req
                    });
                    res.status(200).json({ message: 'Phone verified successfully' });
                }
                else {
                    res.status(400).json({ error: 'Invalid OTP or OTP expired' });
                }
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error verifying Phone.' });
            }
        });
    }
};
__decorate([
    (0, route_1.Route)('post', '/login'),
    (0, validator_1.Validate)(userValidationSchema) // Validation on the request body
], AuthController.prototype, "login", null);
__decorate([
    (0, route_1.Route)('post', '/logout')
], AuthController.prototype, "logout", null);
__decorate([
    (0, route_1.Route)('post', '/send-otp-email'),
    (0, validator_1.Validate)(emailValidationSchema)
], AuthController.prototype, "sendOtpEmail", null);
__decorate([
    (0, route_1.Route)('post', '/verify-email')
], AuthController.prototype, "verifyEmailOtp", null);
__decorate([
    (0, route_1.Route)('post', '/send-otp-phone')
    // @Validate(emailValidationSchema)
], AuthController.prototype, "sendOtpPhone", null);
__decorate([
    (0, route_1.Route)('post', '/verify-phone')
], AuthController.prototype, "verifyPhone", null);
AuthController = __decorate([
    (0, controller_1.Controller)('/api')
], AuthController);
exports.default = AuthController;
