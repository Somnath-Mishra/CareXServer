import { Schema } from "mongoose";
import mongoose from 'mongoose';

const appointmentSchema = Schema({
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nextReferral:{
        type:Schema.Types.ObjectId,
        ref:'Doctor'
    },
    schedule:{
        type:Schema.Types.ObjectId,
        ref:'Schedule'
    },
    prescription:{
        type:String//this is pdf, here only store cloudinary link
    },
    status:{
        type:String,
        enum:['pending','completed'],
        default:'pending'
    },
    payment:{
        type:Schema.Types.ObjectId,
        ref:'Payment'
    },
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    mode:{
        type:String,
        enum:['online','offline'],
        required:true
    }
},
    {
        timestamps: true
    }
)

export const Appointment=mongoose.model('Appointment',appointmentSchema)