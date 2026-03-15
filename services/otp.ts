import crypto from "crypto"
import redis from "./redis.js"


class otpService {
    static async generateOTP(identifier:string) {
        const otp = crypto.randomInt(100000, 999999).toString()
        const attemptsKey = `otp-attempts:${identifier}`
        const attempts = await redis.incr(attemptsKey)

  
    
        if (attempts === 1) await redis.expire(attemptsKey, 60 * 5)
        
        if(attempts > 5)  throw new Error("Too many OTP  request made.. Try again later",)
        
        await redis.set(`otp:${identifier}`,otp,"EX",process.env.OTP_EXPIRES_IN!)
        return otp
    }

    static async verifyOTP(identifier:string,otp: string):Promise<boolean> {
    
        const storedOtp = await redis.get(`otp:${identifier}`)

        if (!storedOtp || storedOtp !== otp) return false 

        await redis.del(`otp:${identifier}`)
        await redis.del(`otp-attempts:${identifier}`)
        return true
        
    }
}

export default otpService