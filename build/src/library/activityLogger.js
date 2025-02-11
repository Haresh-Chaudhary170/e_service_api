"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function logActivity(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userId, action, entity, entityId, details, req }) {
        try {
            yield prisma.activityLog.create({
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
    });
}
