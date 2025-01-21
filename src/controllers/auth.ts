import { Request, Response, NextFunction } from 'express';
import bcrypt from "bcryptjs";
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const userValidationSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

@Controller('/api/users')
class AuthController {

    @Route('post', '/login')
    @Validate(userValidationSchema) // Validation on the request body
    async login(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;

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
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN,
            });

            // Set the token as a cookie with HttpOnly, Secure, and SameSite flags
            res.cookie("token", token, {
                httpOnly: true, // Prevent JavaScript from accessing the token
                secure: process.env.NODE_ENV === "PRODUCTION", // Use secure cookies in production (only sent over HTTPS)
                sameSite: "strict", // Prevent the cookie from being sent with cross-origin requests
                maxAge: 60 * 60 * 1000, // Set expiration time for the cookie (1 hour in this case)
            });

            // Respond with a success message and user data (optional)
            return res.json({
                message: "Login successful",
                user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
            });

        } catch (error) {
            return res.status(500).json({ error: "Error logging in" });
        }
    }

    @Route('post', '/logout') // Logout endpoint
    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Clear the token cookie
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "PRODUCTION", // Secure cookies in production
                sameSite: "strict", // Prevent the cookie from being sent with cross-origin requests
            });

            // Respond with a success message
            res.status(200).json({ message: "Logout successful" });
        } catch (error) {
            console.error("Error during logout:", error);
            res.status(500).json({ error: "Error logging out" });
        }
    }
}

export default AuthController;
