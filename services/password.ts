import bcrypt from "bcrypt"
class password {
    static  hashPassword(password: string):Promise<string> {
        return  bcrypt.hash(password,12)
        
    }

    static  comparePassword(inputPassword:string,storedPassword:string):Promise<boolean> {
        return  bcrypt.compare(inputPassword,storedPassword)
}
    
}



export default password


