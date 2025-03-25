"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationService {
    static async createNotification(notificationData) {
        try {
            const notification = await prisma.notification.create({
                data: {
                    ...notificationData,
                    priority: notificationData.priority || "NORMAL", // Default to NORMAL
                    read: false,
                    createdAt: new Date(),
                },
            });
            return notification;
        }
        catch (error) {
            console.error("Error creating notification:", error);
            throw new Error("Failed to create notification");
        }
    }
    static async getUserNotifications(userId) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }
    static async markAsRead(notificationId) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true, readAt: new Date() },
        });
    }
    static async deleteNotification(notificationId) {
        return await prisma.notification.delete({
            where: { id: notificationId },
        });
    }
}
exports.NotificationService = NotificationService;
