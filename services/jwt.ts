import jwt from "jsonwebtoken"


interface JwtPayload {
    id: string
    iat: number
}

class jwtToken {
    static getSecret() {
        const secret = process.env.JWT_SECRET
        if (!secret) {
            throw new Error("JWT_SECRET is not configured")
        }
        return secret
    }

    static signJwt(id: string) {
        return jwt.sign( {id} , this.getSecret(), {
            expiresIn:process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] ?? "1d"
        })
        
    }

  
    static async verifyJwt(token: string): Promise<JwtPayload> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.getSecret(), (err, decoded) => {
                if (err) return reject(err)
                resolve(decoded as JwtPayload)
            })
        })
    }
}

export default jwtToken
