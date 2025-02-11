"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogSmsSend = LogSmsSend;
// logSmsSend.ts: Decorator to log SMS send
function LogSmsSend(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        const result = originalMethod.apply(this, args);
        console.log(`OTP sent to: ${args[0]}`); // args[0] is the recipient phone number
        return result;
    };
    return descriptor;
}
