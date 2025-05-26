// logEmailSend.ts: Decorator to log email send
export function LogEmailSend(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const result = originalMethod.apply(this, args);
        console.log(`Email sent to: ${args[0]}`); // args[0] is the recipient email
        return result;
    };

    return descriptor;
}
