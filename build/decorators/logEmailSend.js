"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogEmailSend = LogEmailSend;
// logEmailSend.ts: Decorator to log email send
function LogEmailSend(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        const result = originalMethod.apply(this, args);
        console.log(`Email sent to: ${args[0]}`); // args[0] is the recipient email
        return result;
    };
    return descriptor;
}
