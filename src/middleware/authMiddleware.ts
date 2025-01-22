import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include the user property
declare module 'express-serve-static-core' {
    interface Request {
        user?: any;
    }
}
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const checkRole = (roles: string[]=[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Check if the JWT is present in cookies
            const token = req.cookies?.token;

            if (!token) {
                res.status(401).json({ error: "Authentication required!" });
                return;
            }

            if (!JWT_SECRET) {
                res.status(500).json({ error: "You are not logged in" });
                return;
            }

            // Verify and decode the token
            const decoded = jwt.verify(token, JWT_SECRET) as { role: string };

            if (!roles.includes(decoded.role)) {
                res.status(403).json({ error: "Access denied" });
                return;
            }
            // if (roles.length > 0 && (!req.user || !roles.includes(req.user.role))) {
            //     res.status(403).json({ error: "Insufficient permissions" });
            //     return;
            // }

            // Attach decoded information to request for further use
            req.user = decoded;
            next(); // Pass control to the next middleware or route handler
        } catch (error) {
            res.status(403).json({ error: "Not logged in or access denied" });
        }
    };
};
