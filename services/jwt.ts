import jwt from "jsonwebtoken"
import type { UserDoc } from "../models/userModel.js"
import { promisify } from "util"

interface JwtPayload {
    id: string
    iat: number
}

class jwtToken {
    static signJwt(data: UserDoc) {
        
        return jwt.sign({ data }, process.env.JWT_SECRET!, {
            expiresIn:process.env.JWT_EXPIRES_IN as any
        })
        
    }

  
    static async verifyJwt(token: string): Promise<JwtPayload> {
        const verify = promisify<string,string,any>(jwt.verify)
            return await verify(token,process.env.JWT_SECRET!)
    }
}

export default jwtToken