// emailService.ts
import nodemailer from 'nodemailer';

export class EmailService {
    private transporter: nodemailer.Transporter;
    
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    
    async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
        await this.transporter.sendMail({
            from: `"Spare Parts Marketplace" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Please verify your email address',
            html: `
                <div>
                    <h1>Email Verification</h1>
                    <p>Thank you for registering. Please click the link below to verify your email address:</p>
                    <a href="${verificationLink}">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                </div>
            `
        });
    }
}