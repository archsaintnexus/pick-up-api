
import mongoose from "mongoose";
import User from "./userModel.js";
import ErrorClass from "../utils/ErrorClass.js";

/// Interface that describes the properties that are used to create an address
interface AddressAttr {
    user: string;
    street: string;
    state: string;
    country: string;
    label: string,
    isDefault:boolean
}

// Interface that describes the properties that an address document has
interface AddressDoc extends mongoose.Document{
    user: string;
    street: string;
    state: string;
    country: string;
    label: string,
    isDefault:boolean   
}


/// An interface that describes the properties an address Model has

interface AddressModel extends mongoose.Model<AddressDoc>{
    createAddress(attrs:AddressAttr):Promise<AddressDoc>

}

const addressSchema = new mongoose.Schema({
    user: {
        type:mongoose.Schema.ObjectId,
        ref: "user",
        required:true
    },
    street: {
        type: String,
        required: true,
        trim:true
    },
    city: {
        type: String,
        required: true,
        trim:true
    },
    state: {
        type: String,
        required: true,
        trim:true
    },
    country: {
        type: String,
        required:true,
        default:"Nigeria"
    },
    label: {
        type: String,
        enum: ["home", "work", "others"],
        required:true,
        default:"home"
    },
    postalCode: {
        type: String,
        
    },
    isDefault: {
        type: Boolean,
        default:false
    }
})

addressSchema.statics.createAddress =  (attrs: AddressAttr) => {
    return  new Address(attrs).save()
}


addressSchema.pre("save", async function (next: mongoose.CallbackWithoutResultAndOptionalError) {

    if(!this.isNew) return next()
    const count = await mongoose.model("Address").countDocuments({
        user:this.user
    })

    if (count >= 3) return next(new ErrorClass("You are only permitted to create 3 addresses",400)) 
   
    if (!this.isModified("isDefault")) {
        this.isDefault = count === 0
    }
    
    if (this.isDefault) {
            await mongoose.model("Address").updateMany(
                { user: this.user },
                { $set: { isDefault: false } }
            )
        }
    
    next()
    
})

addressSchema.post("save", async function () {
    const userId = this.user

    const count = await mongoose.model("Address").countDocuments({
        user:userId
    })

    if (count >= 2) {
        await User.updateOne({
            _id: userId
        }, {
            $set:{profileCompleted:count >= 2}
        })
    }
})

const Address = mongoose.model<AddressDoc,AddressModel>("Address", addressSchema)


export type { AddressDoc }

export default Address