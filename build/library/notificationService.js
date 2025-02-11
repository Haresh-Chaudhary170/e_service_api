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
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationService {
    static createNotification(notificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield prisma.notification.create({
                    data: Object.assign(Object.assign({}, notificationData), { priority: notificationData.priority || "NORMAL", read: false, createdAt: new Date() }),
                });
                return notification;
            }
            catch (error) {
                console.error("Error creating notification:", error);
                throw new Error("Failed to create notification");
            }
        });
    }
    static getUserNotifications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });
        });
    }
    static markAsRead(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.notification.update({
                where: { id: notificationId },
                data: { read: true, readAt: new Date() },
            });
        });
    }
    static deleteNotification(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.notification.delete({
                where: { id: notificationId },
            });
        });
    }
}
exports.NotificationService = NotificationService;
