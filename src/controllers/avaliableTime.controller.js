import { get } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AvaliableTime } from "../models/avaliableTime.model.js";
import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js"

export const createAvaliableTime = asyncHandler(async (req, res) => {
    const { dateTime, frequency } = req.body;
    if (!dateTime) {
        throw new ApiError(400, "Date and time are required");
    }
    if (!frequency) {
        throw new ApiError(400, "Frequency is required");
    }
    const regularDateTime = new Date(dateTime);
    const avaliableTime = await AvaliableTime.create({
        startTime: regularDateTime,
        frequencyTime: frequency
    })
    if (!avaliableTime) {
        throw new ApiError(500, "Something went wrong while creating the avaliable time");
    }

    const doctorId = req.user._id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        {
            $push: {
                availableTime: avaliableTime._id
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")
    if (!updatedDoctor) {
        throw new ApiError(500, "Something went wrong while updating the doctor");
    }

    res
        .status(200)
        .json(new ApiResponse(
            200,
            { avaliableTime, updatedDoctor },
            "Avaliable time created successfully",
        ))
})

export const getAvaliableTime = asyncHandler(async (req, res) => {
    const { avaliableTimeId } = req.body;
    const doctorId = req.user._id;
    if (!avaliableTimeId) {
        throw new ApiError(400, "Avaliable time id is required");
    }
    let doctorDetails = await Doctor.find({
        availableTime: { $in: avaliableTimeId }
    });
    doctorDetails = doctorDetails[0];
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor not found");
    }
    if (!doctorDetails || !doctorDetails._id || !doctorDetails._id.equals(doctorId)) {
        throw new ApiError(401, "You are not authorized to access this doctor details");
    }

    const avaliableTime = await AvaliableTime.findById(avaliableTimeId);
    if (!avaliableTime) {
        throw new ApiError(404, "Avaliable time not found");
    }
    res
        .status(200)
        .json(new ApiResponse(
            200,
            avaliableTime,
            "Doctor details fetched successfully",
        ))

})

export const deleteAvaliableTime = asyncHandler(async (req, res) => {
    const { avaliableTimeId } = req.body;
    const doctorId = req.user._id;
    if (!avaliableTimeId) {
        throw new ApiError(400, "Avaliable time id is required");
    }
    let doctorDetails = await Doctor.find({
        availableTime: { $in: avaliableTimeId }
    });
    doctorDetails = doctorDetails[0];
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor not found");
    }
    if (!doctorDetails._id.equals(doctorId)) {
        throw new ApiError(401, "You are not authorized to access this doctor details");
    }
    const avaliableTime = await AvaliableTime.findByIdAndDelete(avaliableTimeId);
    if (!avaliableTime) {
        throw new ApiError(404, "Avaliable time not found");
    }
    res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Avaliable time deleted successfully",
        ))
})