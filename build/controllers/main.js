"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const validate_1 = require("../decorators/validate");
const joi_1 = __importDefault(require("joi"));
const dataValidationTest = joi_1.default.object({
    name: joi_1.default.string().required(),
    reason: joi_1.default.string()
});
let MainController = class MainController {
    getHealthCheck(req, res, next) {
        logging.info('Healthcheck route called successfully!');
        return res.status(200).json({ hello: 'world!' });
    }
    postDataCheck(req, res, next) {
        logging.info('Data route called successfully!');
        logging.info('Data: ', req.body);
        return res.status(200).json(req.body);
    }
};
__decorate([
    (0, route_1.Route)('get', '/healthcheck')
], MainController.prototype, "getHealthCheck", null);
__decorate([
    (0, route_1.Route)('post', '/datacheck'),
    (0, validate_1.Validate)(dataValidationTest)
], MainController.prototype, "postDataCheck", null);
MainController = __decorate([
    (0, controller_1.Controller)('/main')
], MainController);
exports.default = MainController;
