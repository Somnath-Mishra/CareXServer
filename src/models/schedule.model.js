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
        default: "online"
    },
    location: {
        type: String,//if mode is online then this is meeting link, else this is physical location address
        trim: true,
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    bookingSlot: {
        type: [String], // an array of booleans
        default: Array(12).fill(null) // initializing the array with 12 false values
    },
}, {
    timestamps: true
})

export const Schedule = mongoose.model("Schedule", scheduleSchema);