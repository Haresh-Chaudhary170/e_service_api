import { PrismaClient } from '@prisma/client'; // Prisma client for DB interactions
import { Bitmoro } from 'bitmoro';

// import { SmsService } from './smsService';
import { LogOtpGeneration } from '../decorators/logOtpGeneration';
const prisma = new PrismaClient();

export class OtpService {
 

    @LogOtpGeneration
    generateOtp(): string {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return otp;
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

    // verify phone otp
    async verifyPhoneOtp(userId: string, otp: string): Promise<boolean> {

        // check if user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        const apiKey = process.env.BITMORO_API_KEY;
        const otpLength = 6;
        const expiryTime = 10; // OTP valid for 10 minutes in seconds
        const bitmoro = new Bitmoro(apiKey!);
        const OtpHandler = bitmoro.getOtpHandler(expiryTime, otpLength)
        const isValid = OtpHandler.verifyOtp(user.id as string, otp);
        console.log(isValid) // true if valid, false if not
        if (isValid) {

            // change otp verified status to true
            await prisma.oTP.update({
                where: { id: userId },
                data: { verified: true }
            });
            // delete old otp
            // res.status(200).json({ message: 'Phone verified successfully' });
            return true; // OTP verified successfully
        }
        else {
            return false
        }
    }
}
