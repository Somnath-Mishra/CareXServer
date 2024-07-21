import { Doctor } from "../models/doctor.model.js";
import { Schedule } from "../models/schedule.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createSchedule = asyncHandler(async (req, res) => {
    const { startTime, endTime, mode, location } = req.body;
    if (!startTime || !endTime) {
        throw new ApiError(400, "Start and end time required for creating schdule")
    }
    if (mode?.trim() !== "" && location?.trim() === "") {
        throw new ApiError(400, "Location required for creating schdule in offline")
    }
    if (mode?.trim() === "") {
        //TODO: call google meet api and create an link for meeting
        //const meetingLink=await googleMeet.createLink();
        //location=meetingLink
    }
    const doctorId = req.user?._id;
    const doctor = Doctor.findById(doctorId).select("-password -refreshToken");
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }
    
    const schedule = await Schedule.create({
        startTime, endTime, mode, location, doctorId
    })
    if (!schedule) {
        throw new ApiError(500, "Something went wrong while creating schedule");
    }
    res
        .status(201)
        .json(new ApiResponse(201, schedule,
            "Schedule created successfully"
        ))

})
export const updateSchedule = asyncHandler(async (req, res) => {
    const { scheduleId, startTime, endTime, mode, location } = req.body;
    if (!scheduleId || !startTime || !endTime) {
        throw new ApiError(400, "Schedule id, start and end time required for updating schedule")
    }

    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    const schedule = await Schedule.findById(scheduleId);
    const doctorId = req.user?._id;
    const doctor = await Doctor.findById(doctorId).select("-password -refreshToken");
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }
    if (!doctor._id.equals(schedule.doctorId)) {
        throw new ApiError(403, "You are not authorized to update this schedule");
    }
    if (doctor.role.trim() !== "doctor") {
        throw new ApiError(403, "You are not authorized to update this schedule");
    }

    if (mode?.trim() !== "" && location?.trim() === "") {
        throw new ApiError(400, "Location required for updating schdule for offline")
    }
    if (mode?.trim() === "") {
        //TODO: call google meet api and create an link for meeting
        //const meetingLink=await googleMeet.createLink();
        //location=meetingLink
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(scheduleId, {
        startDateTime, endDateTime, mode, location
    }, { new: true })

    if (!updateSchedule) {
        throw new ApiError(500, "Something went wrong while updating schedule in database");
    }
    res
        .status(200)
        .json(new ApiResponse(200, updatedSchedule,
            "Schedule updated successfully"
        ))
})
export const deleteSchedule = asyncHandler(async (req, res) => {
    const { scheduleId } = req.body;
    if (!scheduleId) {
        throw new ApiError(400, "Schedule id required for deleting schedule")
    }
    const schedule = await Schedule.findById(scheduleId);
    const doctorId = req.user?._id;
    const doctor = await Doctor.findById(doctorId).select("-password -refreshToken");

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }
    if (!doctor._id.equals(schedule.doctorId)) {
        throw new ApiError(403, "You are not authorized to update this schedule");
    }
    if (doctor.role.trim() !== "doctor") {
        throw new ApiError(403, "You are not authorized to update this schedule");
    }

    await Schedule.findByIdAndDelete(scheduleId);
    res
        .status(200)
        .json(new ApiResponse(200, {},
            "Schedule deleted successfully"
        ))
})

export const getScheduleDetails = asyncHandler(async (req, res) => {
    const doctorId = req.query.doctorId;
    const doctor = await Doctor.findById(doctorId).select("-password -refreshToken");

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const scheduleDetails = await Schedule.aggregate([
        {
            $match: {
                doctorId: doctor._id
            }
        },
        {
            $match: {
                bookingSlot: {
                    $elemMatch: {
                        $eq: null
                    }
                }
            }
        }
    ]);
    if (!scheduleDetails) {
        throw new ApiError(404, "There is no schedule currently have");
    }
    res
        .status(200)
        .json(new ApiResponse(200, scheduleDetails,
            "Schedule details fetched successfully"
        ))
});

export const isScheduleFull = asyncHandler(async (req, res) => {
    const { scheduleId } = req.body;
    if (!scheduleId) {
        throw new ApiError(400, "Schedule id is required for checking wheather the schedule is full");
    }
    const scheduleDetails = await Schedule.findById(scheduleId);
    if (!scheduleDetails) {
        throw new ApiError(404, "Schedule not found");
    }
    const slotInd = scheduleDetails.bookingSlot.map(slot => {
        if (!slot) {
            return slot;
        }
    })
    if (!slotInd) {
        res
            .status(200)
            .json(new ApiResponse(200, true,
                "Schedule is full"
            ))
    }
    res
        .status(200)
        .json(new ApiResponse(200, false,
            "Schedule is not full"
        ))

})