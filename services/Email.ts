import nodemailer from "nodemailer"
import { otpTemplate } from "../templates/otpTemplate.js"
import { resetPasswordTemplate } from "../templates/resetPasswordTemplate.js"





class EmailService {

    private static transporter() {
        console.log(process.env.RESEND_PASSWORD)
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
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: "Your Password Reset Link",
            html: resetPasswordTemplate(resetUrl)
        })
        
    }
}


export default EmailService