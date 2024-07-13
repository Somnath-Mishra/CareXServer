import mongoose, { Schema } from "mongoose";

const avaliableTimeSchema=new Schema({
    startTime:{
        type:Date,
        required:true
    },
    frequencyTime:{
        type:Number,
        required:true
    }
});
export const AvaliableTime=mongoose.model("AvaliableTime",avaliableTimeSchema);