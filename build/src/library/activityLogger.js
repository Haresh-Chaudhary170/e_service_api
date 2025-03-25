"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function logActivity({ userId, action, entity, entityId, details, req }) {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details,
                ipAddress: (req === null || req === void 0 ? void 0 : req.ip) || null,
                userAgent: (req === null || req === void 0 ? void 0 : req.headers['user-agent']) || null,
            },
        });
    }
    catch (error) {
        console.error('Error logging activity:', error);
    }
}
