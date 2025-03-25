"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../decorators/controller");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const route_1 = require("../decorators/route");
const validator_1 = require("../decorators/validator");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bitmoro_1 = require("bitmoro");
const googleapis_1 = require("googleapis");
const client_1 = require("@prisma/client");
const otpService_1 = require("../services/otpService");
const emailService_1 = require("../services/emailService");
const email_templates_1 = __importDefault(require("../templates/email_templates"));
const activityLogger_1 = require("../library/activityLogger");
const prisma = new client_1.PrismaClient();
const google_auth_library_1 = require("google-auth-library");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const userValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
const emailValidationSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
});
let AuthController = class AuthController {
    async signinWithGoogle(req, res, next) {
        const { code } = req.body; // Now expecting an authorization code instead of idToken
        try {
            if (!code) {
                return res.status(400).json({ error: 'Authorization code is required' });
            }
            // Exchange authorization code for tokens
            const { tokens } = await oauth2Client.getToken(code);
            if (!tokens.id_token || !tokens.access_token) {
                return res.status(401).json({ error: 'Failed to retrieve tokens from Google' });
            }
            // Verify the ID token
            const ticket = await oauth2Client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                return res.status(401).json({ error: 'Invalid Google token' });
            }
            const { sub: googleId, email, given_name, family_name, picture } = payload;
            if (!email) {
                return res.status(400).json({ error: 'Email is required from Google' });
            }
            // Check for existing user by either googleId or email
            let user = await prisma.user.findFirst({
                where: {
                    OR: [{ googleId }, { email }],
                },
            });
            // If user exists but googleId is missing, update it
            if (user && !user.googleId) {
                user = await prisma.user.update({
                    where: { email },
                    data: {
                        googleId,
                        googleAccessToken: tokens.access_token,
                        googleRefreshToken: tokens.refresh_token || null,
                        // googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
                    },
                });
            }
            // If user doesn't exist, create a new one
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        googleId,
                        email,
                        firstName: given_name || '',
                        lastName: family_name || '',
                        avatar: picture || '',
                        role: 'CUSTOMER',
                        emailVerified: true,
                        status: 'ACTIVE',
                        googleAccessToken: tokens.access_token,
                        googleRefreshToken: tokens.refresh_token || null,
                        // googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
                    },
                });
                await (0, activityLogger_1.logActivity)({
                    userId: user.id,
                    action: 'Google Sign-Up',
                    entity: 'User',
                    entityId: user.id,
                    details: { email },
                    req,
                });
            }
            else {
                // Update tokens for existing user
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleAccessToken: tokens.access_token,
                        googleRefreshToken: tokens.refresh_token || null,
                        // googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
                    },
                });
                await (0, activityLogger_1.logActivity)({
                    userId: user.id,
                    action: 'Google Sign-In',
                    entity: 'User',
                    entityId: user.id,
                    details: { email },
                    req,
                });
            }
            // Create JWT token
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
            // Set cookie with JWT token
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 1000, // 1 hour
                path: '/',
            });
            res.json({
                message: user.googleId ? 'Google Sign-In successful' : 'Google Sign-Up successful',
                user: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
                googleAccessToken: tokens.access_token, // Optionally send this to frontend if needed immediately
            });
        }
        catch (error) {
            console.error('Google Sign-In Error:', error);
            res.status(500).json({ error: 'Error during Google Sign-In' });
        }
    }
    // @Route('post', '/google-signin')
    // async signinWithGoogle(req: Request, res: Response, next: NextFunction) {
    //     const { idToken } = req.body;
    //     try {
    //         if (!idToken) {
    //             return res.status(400).json({ error: 'ID token is required' });
    //         }
    //         // Verify the Google ID token
    //         const ticket = await client.verifyIdToken({
    //             idToken,
    //             audience: process.env.GOOGLE_CLIENT_ID,
    //         });
    //         const payload = ticket.getPayload();
    //         if (!payload) {
    //             return res.status(401).json({ error: 'Invalid Google token' });
    //         }
    //         const { sub: googleId, email, given_name, family_name, picture } = payload;
    //         if (!email) {
    //             return res.status(400).json({ error: 'Email is required from Google' });
    //         }
    //         // Check for existing user by either googleId or email
    //         let user = await prisma.user.findFirst({
    //             where: {
    //                 OR: [{ googleId }, { email }],
    //             },
    //         });
    //         // If user exists but googleId is missing, update it
    //         if (user && !user.googleId) {
    //             user = await prisma.user.update({
    //                 where: { email },
    //                 data: { googleId },
    //             });
    //         }
    //         // If user doesn't exist, create a new one
    //         if (!user) {
    //             user = await prisma.user.create({
    //                 data: {
    //                     googleId,
    //                     email,
    //                     firstName: given_name || '',
    //                     lastName: family_name || '',
    //                     avatar: picture || '',
    //                     role: 'CUSTOMER',
    //                     emailVerified: true,
    //                     status: 'ACTIVE',
    //                 },
    //             });
    //             await logActivity({
    //                 userId: user.id,
    //                 action: 'Google Sign-Up',
    //                 entity: 'User',
    //                 entityId: user.id,
    //                 details: { email },
    //                 req,
    //             });
    //         } else {
    //             await logActivity({
    //                 userId: user.id,
    //                 action: 'Google Sign-In',
    //                 entity: 'User',
    //                 entityId: user.id,
    //                 details: { email },
    //                 req,
    //             });
    //         }
    //         // Create JWT token
    //         const token = jwt.sign(
    //             { id: user.id, email: user.email, role: user.role },
    //             process.env.JWT_SECRET as string,
    //             { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    //         );
    //         // Set cookie with JWT token
    //         res.cookie('token', token, {
    //             httpOnly: true,
    //             secure: process.env.NODE_ENV === 'production',
    //             sameSite: 'lax',
    //             maxAge: 60 * 60 * 1000, // 1 hour
    //             path: '/',
    //         });
    //         res.json({
    //             message: user.googleId ? 'Google Sign-In successful' : 'Google Sign-Up successful',
    //             user: {
    //                 firstName: user.firstName,
    //                 lastName: user.lastName,
    //                 email: user.email,
    //                 role: user.role,
    //             },
    //         });
    //     } catch (error) {
    //         console.error('Google Sign-In Error:', error);
    //         res.status(500).json({ error: 'Error during Google Sign-In' });
    //     }
    // }
    async login(req, res, next) {
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
            const isPasswordValid = (user === null || user === void 0 ? void 0 : user.password) ? await bcryptjs_1.default.compare(password, user.password) : false;
            if (!isPasswordValid) {
                return res.status(401).json({ error: "Email or password is incorret!" });
            }
            // Generate a token
            if (!JWT_SECRET) {
                return res.status(500).json({ error: "JWT_SECRET is not defined" });
            }
            if (user.role === "CUSTOMER") {
                const customer = await prisma.customer.findUnique({ where: { userId: user.id } });
                customerId = customer === null || customer === void 0 ? void 0 : customer.id;
            }
            else if (user.role === "SERVICE_PROVIDER") {
                const provider = await prisma.serviceProvider.findUnique({ where: { userId: user.id } });
                providerId = provider === null || provider === void 0 ? void 0 : provider.id;
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, customerId: customerId, providerId: providerId }, JWT_SECRET, {
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
        }
        catch (error) {
            return res.status(500).json({ error: "Error logging in" });
        }
    }
    async logout(req, res, next) {
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
    }
    // send otp
    async sendOtpEmail(req, res, next) {
        const otpService = new otpService_1.OtpService();
        const otp = otpService.generateOtp();
        console.log(`Generated OTP is: ${otp}`);
        const emailService = new emailService_1.EmailService();
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
            const emailSent = await emailService.sendEmail(user.email, 'Email Verification', 'This email with otp is sent to you to verify your email. If this action is not initiated by you then please ignore it.', (0, email_templates_1.default)(otp, userName));
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
    }
    // verify email
    async verifyEmailOtp(req, res, next) {
        const { userId, otp } = req.body;
        const otpService = new otpService_1.OtpService();
        try {
            const isVerified = await otpService.verifyOtp(userId, otp, "EMAIL");
            if (isVerified) {
                // Update user's emailVerified status
                const user = await prisma.user.update({
                    where: { id: userId },
                    data: { emailVerified: true }
                });
                await (0, activityLogger_1.logActivity)({
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
    }
    // send otp to phone
    // @Validate(emailValidationSchema)
    async sendOtpPhone(req, res, next) {
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
        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
            return res.status(400).json({ error: 'User with the provided phone number does not exists!' });
        }
        const otp = OtpHandler.registerOtp(user.id);
        const otpMessage = `Your OTP for EService phone verification is ${otp.otp}`;
        const response = await OtpHandler.sendOtpMessage(phone, otpMessage, "BIT_MORE");
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
            });
        }
        else {
            res.status(500).json({ error: 'Error sending OTP' });
        }
    }
    // verify phone otp
    async verifyPhone(req, res, next) {
        const { userId, otp } = req.body;
        const otpService = new otpService_1.OtpService();
        try {
            const isVerified = await otpService.verifyPhoneOtp(userId, otp);
            if (isVerified) {
                // Update user's phoneVerified status
                const user = await prisma.user.update({
                    where: { id: userId },
                    data: { phoneVerified: true }
                });
                await (0, activityLogger_1.logActivity)({
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
    }
};
__decorate([
    (0, route_1.Route)('post', '/google-signin')
], AuthController.prototype, "signinWithGoogle", null);
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
