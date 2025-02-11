"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const checkRole = (roles = []) => {
    return (req, res, next) => {
        var _a;
        try {
            // Check if the JWT is present in cookies
            const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
            if (!token) {
                res.status(401).json({ error: "Authentication required!" });
                return;
            }
            if (!JWT_SECRET) {
                res.status(500).json({ error: "You are not logged in" });
                return;
            }
            // Verify and decode the token
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
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
        }
        catch (error) {
            res.status(403).json({ error: "Not logged in or access denied" });
        }
    };
};
exports.checkRole = checkRole;
