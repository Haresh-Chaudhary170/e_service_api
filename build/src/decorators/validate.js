"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = Validate;
function Validate(schema) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (req, res, next) {
            try {
                await schema.validateAsync(req.body);
            }
            catch (error) {
                logging.error(error);
                return res.status(400).json(error);
            }
            return originalMethod.call(this, req, res, next);
        };
        return descriptor;
    };
}
