import dotenv from 'dotenv'
dotenv.config({ path: '../config.env' })
import { Worker } from "bullmq"
import EmailService from "../services/Email.js";





const emailWorker = new Worker("emailQueue", async (job) => {
    switch (job.name) {
        case "sendOtp": {
            const {email,otp} = job.data
                await EmailService.sendOtp(email,otp)
                    break;
        }
        case "resetPassword": {
            const {email,resetUrl} = job.data
                await EmailService.sendPasswordResetLink(email,resetUrl)
                    break;
        }
        case "email_verified/account_verified": {
            const { email,fullName } = job.data
            
            await EmailService.sendWelcomeEmail(email,fullName)
            break;
        }
            
        case "updatePasswordMail": {
            const { email } = job.data
            
            await EmailService.sendUpdatePasswordMail(email)
            break;
        }
            
        case "resetPasswordMail": {
            const { email } = job.data
            
            await EmailService.sendResetPasswordConfirmEmail(email)
            break;
            }
    }
    
}, {
    connection: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
    }
})


console.log("Worker is listening for jobs...")

emailWorker.on("completed", (job) => {
    console.log(`Job:${job.id}, completed`)
})


emailWorker.on("failed", (job,err) => {
    console.log(`Job:${job!.id}, failed!`,err)
})

emailWorker.on("progress", (job) => {
    console.log(`Job:${job.id}, in progress`)
})
