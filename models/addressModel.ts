
import mongoose from "mongoose";


interface AddressAttr {
    user: string;
    street: string;
    state: string;
    country: string;
    label: string,
    isDefault:boolean
}


interface AddressDoc extends mongoose.Document{
    user: string;
    street: string;
    state: string;
    country: string;
    label: string,
    isDefault:boolean   
}

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


const Address = mongoose.model<AddressDoc,AddressModel>("Address", addressSchema)


export type { AddressDoc }

export default Address