"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogOtpGeneration = LogOtpGeneration;
// Decorator to log OTP generation
function LogOtpGeneration(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args) {
        const otp = originalMethod.apply(this, args);
        console.log(`OTP generated: ${otp}`);
        return otp;
    };
    return descriptor;
}
