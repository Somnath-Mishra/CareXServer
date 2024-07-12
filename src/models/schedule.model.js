import mongoose, { Schema } from "mongoose";

const scheduleSchema = new Schema({
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    mode: {
        type: String,
        enum: ["online", "offline"],
        required: true,
        default: "online"
    },
    location: {
        type: String,//if mode is online then this is meeting link, else this is physical location address
        required: true
    }
},{
    timestamps: true
})

export const Schedule=mongoose.model("Schedule",scheduleSchema);