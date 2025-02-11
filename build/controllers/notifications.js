"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const validator_1 = require("../decorators/validator");
const notificationValidation_1 = require("../validators/notificationValidation");
const notificationService_1 = require("../library/notificationService");
const authMiddleware_1 = require("../middleware/authMiddleware");
let NotificationController = class NotificationController {
    getUserNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const notifications = yield notificationService_1.NotificationService.getUserNotifications(userId);
                return res.json(notifications);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Error fetching notifications" });
            }
        });
    }
    createNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield notificationService_1.NotificationService.createNotification(req.body);
                return res.status(201).json({ message: "Notification created successfully", notification });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Error creating notification" });
            }
        });
    }
    markAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const notification = yield notificationService_1.NotificationService.markAsRead(id);
                return res.json({ message: "Notification marked as read", notification });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Error updating notification" });
            }
        });
    }
    deleteNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield notificationService_1.NotificationService.deleteNotification(id);
                return res.json({ message: "Notification deleted successfully" });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Error deleting notification" });
            }
        });
    }
};
__decorate([
    (0, route_1.Route)("get", "/user/:userId")
], NotificationController.prototype, "getUserNotifications", null);
__decorate([
    (0, route_1.Route)("post", "/create"),
    (0, validator_1.Validate)(notificationValidation_1.notificationValidationSchema)
], NotificationController.prototype, "createNotification", null);
__decorate([
    (0, route_1.Route)("patch", "/mark-as-read/:id")
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, route_1.Route)("delete", "/delete/:id", (0, authMiddleware_1.checkRole)(["ADMIN", "SUPERADMIN"]))
], NotificationController.prototype, "deleteNotification", null);
NotificationController = __decorate([
    (0, controller_1.Controller)("/api/notifications")
], NotificationController);
exports.default = NotificationController;
