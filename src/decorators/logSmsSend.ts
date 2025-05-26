// logSmsSend.ts: Decorator to log SMS send
export function LogSmsSend(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const result = originalMethod.apply(this, args);
        console.log(`OTP sent to: ${args[0]}`); // args[0] is the recipient phone number
        return result;
    };

    return descriptor;
}
