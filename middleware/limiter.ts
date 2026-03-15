import rateLimit from "express-rate-limit";



export const verifyOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message:"Too many OTP verification attempts"

    })


export const resendOtpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    message:"Too many OTP requests. Try again later"
})
    
export const passwordLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message:"Too many attempts made..Try again"
})