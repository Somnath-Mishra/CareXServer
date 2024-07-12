import mongoose, { Schema } from "mongoose";
import { User } from "./user.model";

const doctorSchema = new Schema({
    degree: {
        type: String,
        required: true
    },
    licence: {
        type: String,//cloudinary link, this is a pdf
        required: true
    },
    instituteName: {
        type: String,
        required: true
    },
    specialization: {
        type: Array,//array of string
        required: true
    },
    visitFees: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false
    },
    avaliableTime: {
        type: Schema.Types.ObjectId,
        ref: "Schedule"
    }
},
    {
        timestamps: true
    }

)

export const Doctor=User.discriminator("Doctor",doctorSchema);