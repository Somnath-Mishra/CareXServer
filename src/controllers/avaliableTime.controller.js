import { get } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AvaliableTime } from "../models/avaliableTime.model.js";
import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Types } from "mongoose";

export const createAvaliableTime = asyncHandler(async (req, res) => {
    const { dateTime, frequency } = req.body;
    if (!dateTime) {
        throw new ApiError(400, "Date and time are required");
    }
    if (!frequency) {
        throw new ApiError(400, "Frequency is required");
    }
    const doctorId = req.user._id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }
    if (doctor.role !== "doctor") {
        throw new ApiError(
            401,
            "You are not authorized to create avaliable time"
        );
    }
    if (doctor.isActive === false) {
        throw new ApiError(
            401,
            "You are not authorized to create avaliable time"
        );
    }
    const regularDateTime = new Date(dateTime);
    const avaliableTime = await AvaliableTime.create({
        startTime: regularDateTime,
        frequencyTime: frequency,
    });
    if (!avaliableTime) {
        throw new ApiError(
            500,
            "Something went wrong while creating the avaliable time"
        );
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        {
            $push: {
                availableTime: avaliableTime._id,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");
    if (!updatedDoctor) {
        throw new ApiError(
            500,
            "Something went wrong while updating the doctor"
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            avaliableTime ,
            "Avaliable time created successfully"
        )
    );
});

export const getAvaliableTime = asyncHandler(async (req, res) => {
    const doctorId = req.user._id;
    const doctor = req.user;

    if (doctor.role !== "doctor") {
        throw new ApiError(
            401,
            "You are not authorized to access this doctor details"
        );
    }

    const doctorDetails = await Doctor.findById(doctorId);
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor not found");
    }

    let availableTimes = await Doctor.aggregate([
        {
            $match: {
                _id: new Types.ObjectId(doctorId),
            },
        },
        {
            $unwind: "$availableTime",
        },
        {
            $lookup: {
                from: "avaliabletimes", // Make sure the collection name is correct
                localField: "availableTime",
                foreignField: "_id",
                as: "availableTimeDetails",
            },
        },
        {
            $unwind: "$availableTimeDetails",
        },
        {
            $replaceRoot: { newRoot: "$availableTimeDetails" },
        },
        {
            $project: {
                _id: 1,
                startTime: 1,
                frequencyTime: 1,
            },
        },
    ]);
    // avaliableTimes=avaliableTimes[0];


    if (!availableTimes) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "No avaliable time found"));
    }
    res.status(200).json(
        new ApiResponse(
            200,
            availableTimes,
            "Avaliable time fetched successfully"
        )
    );
});

export const deleteAvaliableTime = asyncHandler(async (req, res) => {
    const avaliableTimeId = req.query.avaliableTimeId;
    const doctorId = req.user._id;
    const doctor = req.user;
    if (!avaliableTimeId) {
        throw new ApiError(400, "Avaliable time id is required");
    }
    if (doctor.role !== "doctor") {
        throw new ApiError(
            401,
            "You are not authorized to delete this doctor schedule"
        );
    }
    let doctorDetails = await Doctor.find({
        availableTime: { $in: avaliableTimeId },
    });
    doctorDetails = doctorDetails[0];
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor not found");
    }
    if (!doctorDetails._id.equals(doctorId)) {
        throw new ApiError(
            401,
            "You are not authorized to access this doctor details"
        );
    }
    const avaliableTime = await AvaliableTime.findByIdAndDelete(
        avaliableTimeId
    );
    if (!avaliableTime) {
        throw new ApiError(404, "Avaliable time not found");
    }
    res.status(200).json(
        new ApiResponse(200, {}, "Avaliable time deleted successfully")
    );
});
