import mongoose from "mongoose";
import password from "../services/password.js";
import crypto from "crypto"



// An interface that describes the properties that are required to create a user.

interface userAttr {
    fullName: string;
    email: string;
    password: string ;
    confirmPassword?: string;
  role: string;
  isVerified: boolean;
    companyName?: string | undefined;
    companyAddress?: string | undefined;
}


// An interface that describes the properties that a user Model has
interface UserModel extends mongoose.Model<UserDoc> {
  createUser(attrs: userAttr): Promise <UserDoc>;
  findUser(email: string):  Promise<UserDoc | null>;
}


// An interface that describes the properties that a User Document has
interface UserDoc extends mongoose.Document{
  fullName: string;
  email: string;
  password: string;
  role: string;
  companyName?: string | undefined;
  companyAddress?: string | undefined;
  confirmPassword?: string | undefined;
  passwordChangedDate?: Date | undefined;
  isVerified?: boolean;
  passwordResetToken?: string | undefined;
  passwordResetExpires?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(userPassword: string): Promise<boolean>;
  changedPasswordAfter(jwtTimeStamp: number): boolean;
  resetPassword(): string;
}



const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim:true
  },
    email: {
        type: String,
    required: true,
      trim: true,
        lowercase:true,
        unique:true
    },
    password: {
        type: String,
      required: true,
      minLength: 8, maxLength: 30
        
    },
    confirmPassword: {
        type: String,
      required: true,
      minLength: 8,
      maxLength:30
    },
    companyName: {
            type: String,
            default: null,
            trim: true,
          },
          companyAddress: {
            type: String,
            default: null,
            trim: true,
          },
          role: {
            type: String,
            enum: ["customer", "business", "admin", "driver"],
            default: "customer",
  },
  passwordChangedDate: {
    type: Date,
    select:false
  },
  passwordResetToken: String,
  passwordResetExpires:Date,
  isVerified: {
    type: Boolean,
    default: false,
  }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps:true
})
  




    userSchema.statics.createUser = async (attrs: userAttr) => {
        return await new User(attrs).save()
    }

  userSchema.statics.findUser = (email: string) => {
    return User.findOne({email})
  }


  userSchema.pre("save", async function (next: mongoose.CallbackWithoutResultAndOptionalError) {
      if (!this.isModified("password")) return next()
      
      this.password = await password.hashPassword(this.password)
      this.set("confirmPassword",undefined)

      

      next()
})

/// to know if the user has changed password
userSchema.pre("save", async function (next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (this.isNew || !this.isModified("password")) return next();

  this.set("passwordChangedDate",Date.now()-1000)
 
 next();
    
})


/// for login purpose 
userSchema.methods.comparePassword = async function (userPassword:string):Promise<boolean> {
  return await password.comparePassword(userPassword,this.password)
}

// To know the validity of the token.. maybe the user has recently changed his password
userSchema.methods.changedPasswordAfter = function (jwtTimeStamp: number):boolean {
  if (this.passwordChangedDate) {
    const passwordTimeStamp = Math.floor(
      this.passwordChangedDate.getTime() / 1000
    );

    return jwtTimeStamp < passwordTimeStamp;
  }
  return false;
}


userSchema.methods.resetPassword = function () {
  const resetToken = crypto.randomBytes(32).toString("hex")
  
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken

}


const User = mongoose.model<UserDoc,UserModel>("User", userSchema)

export type {UserDoc}
export default User
