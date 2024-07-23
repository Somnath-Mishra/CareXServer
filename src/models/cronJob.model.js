import mongoose,{Schema} from "mongoose";

const cronJobSchema=new Schema({
    doctorId:{
        type:Schema.Types.ObjectId,
        ref:"Doctor",
        required:true,
    },
    availableTimeId:{
        type:Schema.Types.ObjectId,
        ref:"AvaliableTime",
        required:true,
    },
    cronExpression:{
        type:String,
        required:true,
    },
    jobName:{
        type:String,
        required:true,
    }
});

export const CronJob=mongoose.model("CronJob",cronJobSchema);