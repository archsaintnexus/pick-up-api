import mongoose from "mongoose";
import password from "../services/password.js";
import crypto from "crypto"
import ErrorClass from "../utils/ErrorClass.js";



// An interface that describes the properties that are required to create a user.

interface userAttr {
    fullName: string;
    email: string;
    password: string ;
    role: string;
  companyName?: string | undefined;
  phoneNumber: string;
  phoneNumber2?: string | undefined;
    companyAddress?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
  }
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
  companyAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
}
  passwordChangedDate?: Date | undefined;
  isVerified?: boolean;
  phoneNumber: string;
  phoneNumber2?: string | undefined
  isActive?: boolean;
  profileCompleted?: boolean;
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
      select:false,
      minLength: 8, maxLength: 30
        
    },
    companyName:{
            type: String,
            default: null,
            trim: true,
          },
          companyAddress: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            country: { type: String, trim: true },
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
  phoneNumber: {
    type: String,
    required:true
  },
  phoneNumber2:String,
  passwordResetToken: String,
  passwordResetExpires:Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default:true
  },
  profileCompleted: {
    type: Boolean,
    default:false
  }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps:true
})
  

userSchema.index({
  role: 1

}, {
  unique:true, partialFilterExpression:{role:"admin"}
})

userSchema.index({ email: 1 }, { unique: true });


userSchema.statics.createUser = async (attrs: userAttr) => {
        return await new User(attrs).save()
    }

userSchema.statics.findUser = (email: string) => {
    return User.findOne({email}).select("+password")
  }

userSchema.pre(/^find/, function (this:mongoose.Query<UserDoc[],UserDoc>, next: mongoose.CallbackWithoutResultAndOptionalError) {
  this.find({ isActive: { $ne: false } })
  
  next()
  })

userSchema.pre("save", async function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (this.isNew &&  this.role === "admin") {
      const count = await mongoose.model("User").countDocuments({ role: "admin" })
      if (count >= 1) return next(new ErrorClass("Only one admin can be created", 400))
      this.isVerified = true
      this.profileCompleted = true
    }
  
  if (this.isModified("password")) {
    this.password = await password.hashPassword(this.password)
     }

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
