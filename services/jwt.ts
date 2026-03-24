import jwt from "jsonwebtoken"


interface JwtPayload {
    id: string
    iat: number
}

class jwtToken {
    static signJwt(id: string) {
        return jwt.sign( {id} , process.env.JWT_SECRET!, {
            expiresIn:process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] ?? "1d"
        })
        
    }

  
    static async verifyJwt(token: string): Promise<JwtPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
                if (err) return reject(err)
                resolve(decoded as JwtPayload)
            })
        })
    }
}

export default jwtToken