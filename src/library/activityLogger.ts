import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

type Logger = {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    details?: object;
    req?: Request;
}
export async function logActivity({ userId, action, entity, entityId, details, req }: Logger): Promise<void> {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details,
                ipAddress: req?.ip || null,
                userAgent: req?.headers['user-agent'] || null,
            },
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}
