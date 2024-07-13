import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const adminSchema=Schema({
    adminType:{
        type:String,
        enum:['Super','Sub'],
        default:'Sub',//default value
        required:true
    }
})

export const Admin=User.discriminator('Admin',adminSchema);