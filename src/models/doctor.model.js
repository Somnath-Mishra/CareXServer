import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

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
        type: [String],//array of string
        required: true
    },
    visitFees: {
        type: Number,
        required: true,
    },
    isActive: {
        type: String,
        enum:['false','true','reject'],
        default: 'false'
    },
    availableTime: [
        {
            type: Schema.Types.ObjectId,
            ref: 'AvaliableTime'
        }
    ]

},
    {
        timestamps: true
    }
)

export const Doctor = User.discriminator("Doctor", doctorSchema);