"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const client_1 = require("@prisma/client"); // Prisma client for DB interactions
const bitmoro_1 = require("bitmoro");
// import { SmsService } from './smsService';
const logOtpGeneration_1 = require("../decorators/logOtpGeneration");
const prisma = new client_1.PrismaClient();
class OtpService {
    generateOtp() {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return otp;
    }
    // Function to verify OTP (interacts with the database, checks expiry, and verifies status)
    verifyOtp(userId, otp, otpType) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpRecord = yield prisma.oTP.findFirst({
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
            yield prisma.oTP.update({
                where: {
                    id: otpRecord.id,
                },
                data: {
                    verified: true, // Mark OTP as verified
                },
            });
            return true; // OTP verified successfully
        });
    }
    // verify phone otp
    verifyPhoneOtp(userId, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            // check if user exists
            const user = yield prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }
            const apiKey = process.env.BITMORO_API_KEY;
            const otpLength = 6;
            const expiryTime = 10; // OTP valid for 10 minutes in seconds
            const bitmoro = new bitmoro_1.Bitmoro(apiKey);
            const OtpHandler = bitmoro.getOtpHandler(expiryTime, otpLength);
            const isValid = OtpHandler.verifyOtp(user.id, otp);
            console.log(isValid); // true if valid, false if not
            if (isValid) {
                // change otp verified status to true
                yield prisma.oTP.update({
                    where: { id: userId },
                    data: { verified: true }
                });
                // delete old otp
                // res.status(200).json({ message: 'Phone verified successfully' });
                return true; // OTP verified successfully
            }
            else {
                return false;
            }
        });
    }
}
exports.OtpService = OtpService;
__decorate([
    logOtpGeneration_1.LogOtpGeneration
], OtpService.prototype, "generateOtp", null);
