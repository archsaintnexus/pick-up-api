import jwt from "jsonwebtoken"
import { promisify } from "util"

interface JwtPayload {
    id: string
    iat: number
}

class jwtToken {
    static signJwt(id: string) {
        return jwt.sign( {id} , process.env.JWT_SECRET!, {
            expiresIn:process.env.JWT_EXPIRES_IN as any
        })
        
    }

  
    static async verifyJwt(token: string): Promise<JwtPayload> {
        const verify = promisify<string,string,any>(jwt.verify)
            return await verify(token,process.env.JWT_SECRET!)
    }
}

export default jwtToken