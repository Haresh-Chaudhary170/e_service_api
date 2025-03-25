import { Request as ExpressRequest, Response, NextFunction } from 'express';
import session, { Session, SessionData } from 'express-session'; // Import session middleware and types

// Extend the Request interface to include session
interface Request extends ExpressRequest {
    session: Session & Partial<SessionData> & {
        state?: string;
    };
}

import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { google } from 'googleapis';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import * as https from 'https';
import * as url from 'url';
import { PrismaClient } from "@prisma/client";
import { logActivity } from '../library/activityLogger';

const prisma = new PrismaClient();

// Define your OAuth2Client and scopes
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const scopes = [
    'https://www.googleapis.com/auth/calendar.events'
];

// Global variable for storing user credentials
let userCredential: any = null;

@Controller('/api')
class GoogleController {
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

    @Route('get', '/googlesignin') // Changed from 'post' to 'get' since this is a redirect
    async signinWithGoogle(req: Request, res: Response, next: NextFunction) {
        const state = randomBytes(32).toString('hex');

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
    }

    @Route('get', '/oauth2callback')
    async oauth2Callback(req: Request, res: Response, next: NextFunction) {
        const q = url.parse(req.url, true).query;

        if (q.error) {
            console.log('Error:', q.error);
            res.send('Error: ' + q.error);
            // } else if (!req.session || q.state !== req.session.state) {
            //     console.log('State mismatch or session not initialized. Possible CSRF attack');
            //     res.send('State mismatch or session not initialized. Possible CSRF attack');
        } else {
            try {
                const { tokens } = await oauth2Client.getToken(q.code as string);
                oauth2Client.setCredentials(tokens);
                userCredential = tokens;
                console.log(tokens)

                // Verify the ID token
                const ticket = await oauth2Client.verifyIdToken({
                    idToken: tokens?.id_token ?? '',
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

                    await logActivity({
                        userId: user.id,
                        action: 'Google Sign-Up',
                        entity: 'User',
                        entityId: user.id,
                        details: { email },
                        req,
                    });
                

                    res.redirect(`http://localhost:3000/register?loginType=SIGNUP&userId=${user.id}`);
                } else {
                    // Update tokens for existing user
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            googleAccessToken: tokens.access_token,
                            googleRefreshToken: tokens.refresh_token || null,
                            // googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
                        },
                    });

                    await logActivity({
                        userId: user.id,
                        action: 'Google Sign-In',
                        entity: 'User',
                        entityId: user.id,
                        details: { email },
                        req,
                    });

                    // Create JWT token
                    const token = jwt.sign(
                        { id: user.id, email: user.email, role: user.role },
                        process.env.JWT_SECRET as string,
                        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
                    );

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


            } catch (error) {
                console.error('Google Sign-In Error:', error);
                res.status(500).json({ error: 'Error during Google Sign-In' });
            }
        }
    }

    @Route('get', '/revoke')
    async revokeToken(req: Request, res: Response, next: NextFunction) {
        if (!userCredential?.access_token) {
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
    }
}

export { GoogleController };