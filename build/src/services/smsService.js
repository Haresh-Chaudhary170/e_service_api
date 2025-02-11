"use strict";
// import { LogSmsSend } from '../decorators/logSmsSend';
// import twilio from 'twilio';
Object.defineProperty(exports, "__esModule", { value: true });
// export class SmsService {
//     private client: twilio.Twilio;
//     constructor() {
//         // Initialize Twilio client with Account SID and Auth Token from your Twilio account
//         this.client = twilio('your_account_sid', 'your_auth_token');
//     }
//     @LogSmsSend
//     async sendOtp(phoneNumber: string, otp: string): Promise<void> {
//         try {
//             const message = await this.client.messages.create({
//                 body: `Your OTP code is: ${otp}`,
//                 from: 'your_twilio_phone_number',  // Twilio phone number you purchased
//                 to: phoneNumber,                   // Recipient's phone number
//             });
//             console.log('SMS sent:', message.sid);
//         } catch (error) {
//             console.error('Error sending SMS:', error);
//         }
//     }
// }
