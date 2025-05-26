import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface NotificationData {
    userId: string;
    title: string;
    titleNp?: string;
    message: string;
    messageNp?: string;
    type: "BOOKING" | "PAYMENT" | "SYSTEM" | "PROMOTIONAL";
    priority?: "HIGH" | "NORMAL" | "LOW";
    actionUrl?: string;
    image?: string;
    data?: any;
    expiresAt?: Date;
}

export class NotificationService {
    static async createNotification(notificationData: NotificationData) {
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
        } catch (error) {
            console.error("Error creating notification:", error);
            throw new Error("Failed to create notification");
        }
    }

    static async getUserNotifications(userId: string) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    static async markAsRead(notificationId: string) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true, readAt: new Date() },
        });
    }

    static async deleteNotification(notificationId: string) {
        return await prisma.notification.delete({
            where: { id: notificationId },
        });
    }
}
