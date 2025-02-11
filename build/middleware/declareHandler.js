"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declareHandler = declareHandler;
function declareHandler(req, res, next) {
    req.mongoGet = undefined;
    req.mongoGetAll = [];
    req.mongoCreate = undefined;
    req.mongoUpdate = undefined;
    req.mongoQuery = [];
    next();
}
