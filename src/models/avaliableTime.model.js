import mongoose, { Schema } from "mongoose";

const avaliableTimeSchema=new Schema({
    startTime:{
        type:Date,
        required:true
    },
    frequencyTime:{
        type:Number,
    }
});
export const AvaliableTime=mongoose.model("AvaliableTime",avaliableTimeSchema);