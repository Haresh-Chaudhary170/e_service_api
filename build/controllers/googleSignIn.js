"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.GoogleController = void 0;
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const googleapis_1 = require("googleapis");
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const https = __importStar(require("https"));
const url = __importStar(require("url"));
const client_1 = require("@prisma/client");
const activityLogger_1 = require("../library/activityLogger");
const prisma = new client_1.PrismaClient();
// Define your OAuth2Client and scopes
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
const scopes = [
    'https://www.googleapis.com/auth/calendar.events'
];
// Global variable for storing user credentials
let userCredential = null;
let GoogleController = class GoogleController {
    // Make sure to add session middleware to your Express app before using this controller
    // Example setup:
    /*
    import session from 'express-session';
    app.use(session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true } // use 'secure: true' in production with HTTPS
    }));
    */
    signinWithGoogle(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const state = (0, crypto_1.randomBytes)(32).toString('hex');
            // Initialize session if it doesn't exist
            if (!req.session) {
                return res.status(500).send('Session not initialized');
            }
            req.session.state = state;
            const authorizationUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: scopes,
                include_granted_scopes: true,
                state: state,
            });
            return res.status(200).json(authorizationUrl);
        });
    }
    oauth2Callback(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const q = url.parse(req.url, true).query;
            if (q.error) {
                console.log('Error:', q.error);
                res.send('Error: ' + q.error);
                // } else if (!req.session || q.state !== req.session.state) {
                //     console.log('State mismatch or session not initialized. Possible CSRF attack');
                //     res.send('State mismatch or session not initialized. Possible CSRF attack');
            }
            else {
                try {
                    const { tokens } = yield oauth2Client.getToken(q.code);
                    oauth2Client.setCredentials(tokens);
                    userCredential = tokens;
                    console.log(tokens);
                    // Verify the ID token
                    const ticket = yield oauth2Client.verifyIdToken({
                        idToken: (_a = tokens === null || tokens === void 0 ? void 0 : tokens.id_token) !== null && _a !== void 0 ? _a : '',
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
                    let user = yield prisma.user.findFirst({
                        where: {
                            OR: [{ googleId }, { email }],
                        },
                    });
                    // If user exists but googleId is missing, update it
                    if (user && !user.googleId) {
                        user = yield prisma.user.update({
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
                        user = yield prisma.user.create({
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
                        yield (0, activityLogger_1.logActivity)({
                            userId: user.id,
                            action: 'Google Sign-Up',
                            entity: 'User',
                            entityId: user.id,
                            details: { email },
                            req,
                        });
                        res.redirect(`http://localhost:3000/register?loginType=SIGNUP&userId=${user.id}`);
                    }
                    else {
                        // Update tokens for existing user
                        user = yield prisma.user.update({
                            where: { id: user.id },
                            data: {
                                googleAccessToken: tokens.access_token,
                                googleRefreshToken: tokens.refresh_token || null,
                                // googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
                            },
                        });
                        yield (0, activityLogger_1.logActivity)({
                            userId: user.id,
                            action: 'Google Sign-In',
                            entity: 'User',
                            entityId: user.id,
                            details: { email },
                            req,
                        });
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
                        res.redirect(`http://localhost:3000/register?loginType=SIGNIN&userId=${user.id}`);
                    }
                }
                catch (error) {
                    console.error('Google Sign-In Error:', error);
                    res.status(500).json({ error: 'Error during Google Sign-In' });
                }
            }
        });
    }
    revokeToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(userCredential === null || userCredential === void 0 ? void 0 : userCredential.access_token)) {
                return res.status(400).send('No token to revoke');
            }
            const postData = `token=${userCredential.access_token}`;
            const postOptions = {
                host: 'oauth2.googleapis.com',
                port: 443,
                path: '/revoke',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData),
                },
            };
            const postReq = https.request(postOptions, function (response) {
                response.setEncoding('utf8');
                let data = '';
                response.on('data', (d) => {
                    data += d;
                });
                response.on('end', () => {
                    console.log('Response:', data);
                    res.send('Token revoked');
                });
            });
            postReq.on('error', (error) => {
                console.log(error);
                res.status(500).send('Error revoking token');
            });
            postReq.write(postData);
            postReq.end();
        });
    }
};
exports.GoogleController = GoogleController;
__decorate([
    (0, route_1.Route)('get', '/googlesignin') // Changed from 'post' to 'get' since this is a redirect
], GoogleController.prototype, "signinWithGoogle", null);
__decorate([
    (0, route_1.Route)('get', '/oauth2callback')
], GoogleController.prototype, "oauth2Callback", null);
__decorate([
    (0, route_1.Route)('get', '/revoke')
], GoogleController.prototype, "revokeToken", null);
exports.GoogleController = GoogleController = __decorate([
    (0, controller_1.Controller)('/api')
], GoogleController);
