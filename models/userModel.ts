import mongoose from "mongoose";
import password from "../services/password.js";

// const userSchema = new mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//     },
//     companyName: {
//       type: String,
//       default: null,
//       trim: true,
//     },
//     companyAddress: {
//       type: String,
//       default: null,
//       trim: true,
//     },
//     role: {
//       type: String,
//       enum: ["customer", "business", "admin", "driver"],
//       default: "customer",
//     },
//     password: {
//       type: String,
//       required: true,
//       minlength: 8,
//     },
//   },
//   { timestamps: true }
// );


// An interface that describes the properties that are required to create a user.

interface userAttr {
    email: string;
    password: string;
    confirmPassword: string;
}


// An interface that describes the properties that a user Model has
interface UserModel extends mongoose.Model<UserDoc> {
    createUser(attrs: userAttr): UserDoc;
}


// An interface that describes the properties that a User Document has
interface UserDoc extends mongoose.Document{
    email: string;
    password: string;
    confirmPassword?: string | undefined;
    // comparePassword(candidatePassword: string): Promise<boolean>;
}



const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required:true
    },
    confirmPassword: {
        type: String,
        required:true
    }

})

userSchema.statics.createUser = (attrs: userAttr) => {
    return new User(attrs)
}


userSchema.pre("save", async function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (!this.isModified("password")) return next()
    
    this.password = await password.hashPassword(this.password)
    this.set("confirmPassword",undefined)

    

    next()
})


userSchema.pre("save", async function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    
})


const User = mongoose.model<UserDoc,UserModel>("User", userSchema)


export default User
