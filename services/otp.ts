import crypto from "crypto"
import redis from "./redis.js"

class OTP {
    static async generateOTP(identifier:string) {
        const otp = crypto.randomInt(100000, 999999).toString()
        await redis.set(`otp:${identifier}`,otp,"EX",process.env.OTP_EXPIRES_IN!)

        return otp
        
    }

    static async verifyOTP(identifier:string,otp: string):Promise<boolean> {
    
        const storedOtp = await redis.get(`otp:${identifier}`)

        if (!storedOtp || storedOtp !== otp) return false 

        await redis.del(`otp:${identifier}`)
        
        return true
        
    }
}

export default OTP