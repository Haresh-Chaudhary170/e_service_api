"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = Route;
function Route(method, path = '', ...middleware) {
    return (target, key, descriptor) => {
        var _a;
        const routePath = `${path}`;
        const routeHandlers = Reflect.getMetadata('routeHandlers', target) || new Map();
        if (!routeHandlers.has(method)) {
            routeHandlers.set(method, new Map());
        }
        (_a = routeHandlers.get(method)) === null || _a === void 0 ? void 0 : _a.set(routePath, [...middleware, descriptor.value]);
        Reflect.defineMetadata('routeHandlers', routeHandlers, target);
    };
}
