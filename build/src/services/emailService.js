"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const logEmailSend_1 = require("../decorators/logEmailSend");
class EmailService {
    constructor() {
        // Configure the transporter with email service (e.g., Gmail, SMTP)
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    async sendEmail(to, subject, text, html) {
        const mailOptions = {
            from: "E Service",
            to: to,
            subject: subject,
            text: text,
            html: html,
        };
        // Send email using the transporter
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
            return true;
        }
        catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}
exports.EmailService = EmailService;
__decorate([
    logEmailSend_1.LogEmailSend
], EmailService.prototype, "sendEmail", null);
