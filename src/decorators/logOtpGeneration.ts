// Decorator to log OTP generation
export function LogOtpGeneration(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const otp = originalMethod.apply(this, args);
        console.log(`OTP generated: ${otp}`);
        return otp;
    };

    return descriptor;
}
