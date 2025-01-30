import { Request, Response, NextFunction } from "express";
import { Controller } from "../decorators/controller";
import { Route } from "../decorators/route";
import { Validate } from "../decorators/validator";
import { notificationValidationSchema } from "../validators/notificationValidation";
import { NotificationService } from "../library/notificationService";
import { checkRole } from "../middleware/authMiddleware";

@Controller("/api/notifications")
class NotificationController {
    @Route("get", "/user/:userId")
    async getUserNotifications(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const notifications = await NotificationService.getUserNotifications(userId);
            return res.json(notifications);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error fetching notifications" });
        }
    }

    @Route("post", "/create")
    @Validate(notificationValidationSchema)
    async createNotification(req: Request, res: Response) {
        try {
            const notification = await NotificationService.createNotification(req.body);
            return res.status(201).json({ message: "Notification created successfully", notification });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error creating notification" });
        }
    }

    @Route("patch", "/mark-as-read/:id")
    async markAsRead(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const notification = await NotificationService.markAsRead(id);
            return res.json({ message: "Notification marked as read", notification });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error updating notification" });
        }
    }

    @Route("delete", "/delete/:id", checkRole(["ADMIN", "SUPERADMIN"]))
    async deleteNotification(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await NotificationService.deleteNotification(id);
            return res.json({ message: "Notification deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error deleting notification" });
        }
    }
}

export default NotificationController;
