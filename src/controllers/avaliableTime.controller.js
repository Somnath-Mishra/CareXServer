import { get } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AvaliableTime } from "../models/avaliableTime.model.js";
import { Doctor } from "../models/doctor.model.js";

export const createAvaliableTime = asyncHandler(async (req, res) => {
    const { dateTime, frequency } = req.body;
    if (!dateTime) {
        throw new ApiError(400, "Date and time are required");
    }
    if (!frequency) {
        throw new ApiError(400, "Frequency is required");
    }
    const avaliableTime = await AvaliableTime.create({
        dateTime,
        frequency
    })
    if (!avaliableTime) {
        throw new ApiError(500, "Something went wrong while creating the avaliable time");
    }
    res
        .status(200)
        .json(new ApiResponse(
            200,
            avaliableTime,
            "Avaliable time created successfully",
        ))
})

export const getAvaliableTime = asyncHandler(async (req, res) => {
    const { avaliableTimeId } = req.body;
    const doctorId = req.user._id;
    if (!avaliableTimeId) {
        throw new ApiError(400, "Avaliable time id is required");
    }
    const doctorDetails = await Doctor.find({
        avaliableTime: avaliableTimeId
    });
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor not found");
    }
    if (doctorDetails._id !== doctorId) {
        throw new ApiError(401, "You are not authorized to access this doctor details");
    }
    const avaliableTime = await AvaliableTime.findById(avaliableTimeId);
    if(!avaliableTime){
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

export const deleteAvaliableTime=asyncHandler(async(req,res)=>{
    const {avaliableTimeId}=req.body;
    const doctorId=req.user._id;
    if(!avaliableTimeId){
        throw new ApiError(400, "Avaliable time id is required");
    }
    const doctorDetails=await Doctor.find({
        avaliableTime:avaliableTimeId
    });
    if(!doctorDetails){
        throw new ApiError(404, "Doctor not found");
    }
    if(doctorDetails._id!==doctorId){
        throw new ApiError(401, "You are not authorized to access this doctor details");
    }
    const avaliableTime=await AvaliableTime.findByIdAndDelete(avaliableTimeId);
    if(!avaliableTime){
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