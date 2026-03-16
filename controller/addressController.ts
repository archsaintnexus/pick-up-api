import type { NextFunction, Request, Response } from "express";
import Address from "../models/addressModel.js";
import ErrorClass from "../utils/ErrorClass.js";






export async function createAddress(req:Request,res:Response,next:NextFunction) {
    const count = await Address.countDocuments({
        user: req.user._id
    })

    if (count >= 3) return next(new ErrorClass("You are only permitted to create 3 addresses", 400))
    
    const address = await Address.createAddress({
        user: req.user._id,
        ...req.body,
        isDefault: count === 0

    })


    res.status(201).json({
        status: "Success",
        message: "You Address has been saved Successfully",
        data: {
            address
        }
    })


    
}


export async function setDefault(req: Request, res: Response, next: NextFunction) {
    const { addressId } = req.params
    const address = await Address.findOne({
        _id: addressId,
        user: req.user._id
    })

    if (!address) {
        return next(new ErrorClass("Address not found", 404))
    }
    await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
    )

    address.isDefault = true
    await address.save()

    res.status(200).json({
        status: "success",
        message: "Default address updated"
    })
    
}



export async function updateAddress(req: Request, res: Response, next: NextFunction) {
    const { addressId } = req.params
    
    const address = await Address.findOneAndUpdate({
        _id:addressId, user:req.user._id
    }, req.body, {
        new:true,runValidators:true
    })

    if (!address) return next(new ErrorClass("Address not found", 404))
    
    res.status(200).json({
        status: "Success",
        message: "Address Updated Successfully",
        data: {
            address
        }
    })
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
    const { addressId } = req.params
    const count = await Address.countDocuments({
        user: req.user._id,
    })

    if (count <= 1) return next(new ErrorClass("You cannot delete the only address available", 400))
    
   const deletedAddress =  await Address.findOneAndDelete({
        _id: addressId,
        user:req.user._id
   })
    
    
   if (!deletedAddress) {
    return next(new ErrorClass("Address not found", 404))
}
    
    if (deletedAddress?.isDefault) {
        await Address.updateOne(
            { user: req.user._id },
            { $set: { isDefault: true } }
        )
    }



    res.status(200).json({
        status: "Success",
        message:"Address Deleted Successfully"
    })


}



export async function getAllAddress(req: Request, res: Response, next: NextFunction) {
    const address = await Address.find({
        user:req.user._id
    })

    if (!address) return next(new ErrorClass("Address not found", 404))
    
    res.status(200).json({
        status: "Success",
        data: {
            address
        }
    })
}