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
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma = new client_1.PrismaClient();
let ActivityController = class ActivityController {
    getCategoriesAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const activities = yield prisma.activityLog.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
                res.status(200).json(activities);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching activities" });
            }
        });
    }
    // get single log
    getActivityLog(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const activity = yield prisma.activityLog.findUnique({ where: { id } });
                if (!activity) {
                    return res.status(404).json({ error: "Activity not found" });
                }
                res.status(200).json(activity);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching activity" });
            }
        });
    }
};
__decorate([
    (0, route_1.Route)('get', '/activity-log', (0, authMiddleware_1.checkRole)(['ADMIN', 'CUSTOMER', 'SERVICE_PROVIDER']))
], ActivityController.prototype, "getCategoriesAdmin", null);
__decorate([
    (0, route_1.Route)('get', '/activity-log/:id', (0, authMiddleware_1.checkRole)(['ADMIN', 'CUSTOMER', 'SERVICE_PROVIDER']))
], ActivityController.prototype, "getActivityLog", null);
ActivityController = __decorate([
    (0, controller_1.Controller)('/api/activities')
], ActivityController);
exports.default = ActivityController;
