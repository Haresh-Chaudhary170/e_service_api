import { Request, Response, NextFunction } from 'express';
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

@Controller('/api/activities')
class ActivityController {
    @Route('get', '/activity-log', checkRole(['ADMIN', 'CUSTOMER', 'SERVICE_PROVIDER']))
    async getCategoriesAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const activities = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' } });
            res.status(200).json(activities);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching activities" });
        }
    }
}

export default ActivityController;