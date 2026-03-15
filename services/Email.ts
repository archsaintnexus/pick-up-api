import nodemailer from "nodemailer"
import { otpTemplate } from "../templates/otpTemplate.js"
import { resetPasswordTemplate } from "../templates/resetPasswordTemplate.js"
import { welcomeTemplate } from "../templates/welcomeEmail.js"
import { updatePasswordTemplate } from "../templates/updatePassword.js"
import { resetPasswordConfirmTemplate } from "../templates/resetPasswordMail.js"





class EmailService {

    private static transporter() {
      
        return  nodemailer.createTransport({
            host: 'smtp.resend.com',
            secure: true,
            port: 465,
            auth: {
                user: "resend",
                pass: process.env.RESEND_PASSWORD,
            },
                         
        })
    } 
    
    static async sendOtp(email:string,otp:string) {

        await this.transporter().sendMail({
            from: `<${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Your OTP Code",
            html: otpTemplate(otp)
        })
        
    }
    static async sendPasswordResetLink(email: string, resetUrl: string) {
        await this.transporter().sendMail({
            from: `<${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Your Password Reset Link",
            html: resetPasswordTemplate(resetUrl)
        })
        
    }
    static async sendWelcomeEmail(email: string,fullName:string) {
        
        await this.transporter().sendMail({
            from: `<${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Welcome — Account Verified",
            html: welcomeTemplate(email,fullName)
            
        })
    }
    static async sendUpdatePasswordMail(email: string) {
        await this.transporter().sendMail({
            from: `<${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Your Password Was Updated",
            html: updatePasswordTemplate(email)
            
        })
    }
    static async sendResetPasswordConfirmEmail(email: string) {
        await this.transporter().sendMail({
            from: `<${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Your Password Was Reset",
            html: resetPasswordConfirmTemplate(email)
            
        })
    }
}


export default EmailService