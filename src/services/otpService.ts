import { PrismaClient } from '@prisma/client'; // Prisma client for DB interactions

// import { SmsService } from './smsService';
import { LogOtpGeneration } from '../decorators/logOtpGeneration';
const prisma = new PrismaClient();

export class OtpService {
    // private smsService: SmsService;
    private otpStorage: Record<string, string>;  // Store OTPs by phone number

    constructor() {
        // this.smsService = new SmsService();
        this.otpStorage = {};  // Initialize in-memory OTP storage
    }

    @LogOtpGeneration
    generateOtp(): string {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return otp;
    }

    async sendOtpToPhone(phoneNumber: string): Promise<void> {
        const otp = this.generateOtp();
        this.otpStorage[phoneNumber] = otp;  // Store OTP temporarily
        // await this.smsService.sendOtp(phoneNumber, otp);
        console.log(`OTP stored for ${phoneNumber}: ${otp}`);  // For testing (remove in production)
    }

    // Function to verify OTP (interacts with the database, checks expiry, and verifies status)
    async verifyOtp(userId: string, otp: string, otpType: 'EMAIL' | 'PHONE'): Promise<boolean> {
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                userId: userId,
                type: otpType,
                otp: otp,
            },
        });

        // If OTP doesn't exist or expired
        if (!otpRecord) {
            throw new Error('OTP not found or expired');
        }

        const currentTime = new Date();

        // Check if the OTP is expired
        if (otpRecord.expiresAt < currentTime) {
            throw new Error('OTP has expired');
        }

        // Check if the OTP is already verified
        if (otpRecord.verified) {
            throw new Error('OTP already verified');
        }

        // Mark OTP as verified in the database
        await prisma.oTP.update({
            where: {
                id: otpRecord.id,
            },
            data: {
                verified: true, // Mark OTP as verified
            },
        });

        return true;  // OTP verified successfully
    }
}
