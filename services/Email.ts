import nodemailer from "nodemailer"
import { otpTemplate } from "../templates/otpTemplate.js"
import { resetPasswordTemplate } from "../templates/resetPasswordTemplate.js"
import { welcomeTemplate } from "../templates/welcomeEmail.js"
import { updatePasswordTemplate } from "../templates/updatePassword.js"
import { resetPasswordConfirmTemplate } from "../templates/resetPasswordMail.js"

class EmailService {
    private static getSmtpPassword() {
        const password = process.env.RESEND_API_KEY || process.env.RESEND_PASSWORD
        if (!password) {
            throw new Error("Missing Resend SMTP credential. Set RESEND_API_KEY or RESEND_PASSWORD.")
        }
        return password
    }

    private static getFromEmail() {
        const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM
        if (!fromEmail) {
            throw new Error("Missing sender email. Set RESEND_FROM_EMAIL or EMAIL_FROM.")
        }
        return fromEmail
    }

    private static transporter() {
        return nodemailer.createTransport({
            host: "smtp.resend.com",
            secure: true,
            port: 465,
            auth: {
                user: "resend",
                pass: this.getSmtpPassword(),
            },
        })
    }

    static async sendOtp(email: string, otp: string) {
        await this.transporter().sendMail({
            from: `<${this.getFromEmail()}>`,
            to: email,
            subject: "Your OTP Code",
            html: otpTemplate(otp),
        })
    }

    static async sendPasswordResetLink(email: string, resetUrl: string) {
        await this.transporter().sendMail({
            from: `<${this.getFromEmail()}>`,
            to: email,
            subject: "Your Password Reset Link",
            html: resetPasswordTemplate(resetUrl),
        })
    }

    static async sendWelcomeEmail(email: string, fullName: string) {
        await this.transporter().sendMail({
            from: `<${this.getFromEmail()}>`,
            to: email,
            subject: "Welcome - Account Verified",
            html: welcomeTemplate(email, fullName),
        })
    }

    static async sendUpdatePasswordMail(email: string) {
        await this.transporter().sendMail({
            from: `<${this.getFromEmail()}>`,
            to: email,
            subject: "Your Password Was Updated",
            html: updatePasswordTemplate(email),
        })
    }

    static async sendResetPasswordConfirmEmail(email: string) {
        await this.transporter().sendMail({
            from: `<${this.getFromEmail()}>`,
            to: email,
            subject: "Your Password Was Reset",
            html: resetPasswordConfirmTemplate(email),
        })
    }
}

export default EmailService
