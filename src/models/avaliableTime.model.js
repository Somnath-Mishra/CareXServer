import mongoose, { Schema } from "mongoose";

const avaliableTimeSchema=new Schema({
    startTime:{
        type:Date,
        required:true
    },
    frequencyTime:{
        type:Number,
    },
    mode:{
        type:String,
        enum:["online","offline"],
        default:"online"
    },
    location:{
        type:String,
        required:true,
    }
});
export const AvaliableTime=mongoose.model("AvaliableTime",avaliableTimeSchema);