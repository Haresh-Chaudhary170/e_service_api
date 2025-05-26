import nodemailer from 'nodemailer';
import { LogEmailSend } from '../decorators/logEmailSend';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Configure the transporter with email service (e.g., Gmail, SMTP)
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    @LogEmailSend
    async sendEmail(to: string, subject: string, text: string, html:string): Promise<boolean> {
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
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
}
