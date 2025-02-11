"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = Controller;
function Controller(baseRoute = '') {
    return (target) => {
        Reflect.defineMetadata('baseRoute', baseRoute, target);
    };
}
