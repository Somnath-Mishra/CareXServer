import mongoose,{ Schema } from "mongoose";

const paymentSchema=Schema({
    user:{
        type:Schema.Types.ObjectId,
        required:true
    },
    doctor:{
        type:Schema.Types.ObjectId,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        required:true,
        default:"USD"
    },
    paymentMethod:{
        type:String,
        required:true
    },
    paymentStatus:{
        type:String,
        enum:["success","failed","pending"],
        default:"pending"
    },
    paymentReferrence:{
        type:String,
        required:true
    },
    invoice:{
        type:String,//this is pdf and store only cloudinary link
    }
})

export const Payment=mongoose.model("Payment",paymentSchema)