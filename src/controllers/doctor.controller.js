import { Doctor } from "../models/doctor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {uploadOnCloudinary, uploadPDFOnCloudinary} from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"

export const uploadDoctorSpecificDetails = asyncHandler(async (req, res) => {
    const { degree,
        instituteName,
        specialization,
        visitFees,
        avaliableTimeIds
    } = req.body;
    if (!degree || !instituteName || !specialization || !visitFees || !avaliableTimeId || !frequencyOfSchedule) {
        throw new ApiError(400, "All fields are required");
    }
    const doctorDetails = await Doctor.findById(req.user.id);
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor not found");
    }

    const role = 'doctor';
    const doctor = await Doctor.findByIdAndUpdate(req.user.id, {
        degree,
        instituteName,
        specialization,
        visitFees,
        avaliableTimeIds,
        role
    }, { new: true })
    if (!doctor) {
        throw new ApiError(500, "Something went wrong while updating doctor details");
    }
    res
        .status(200)
        .json(new ApiResponse(
            200,
            doctor,
            "Doctor details updated successfully"
        ))
})

export const getPatientDetails = asyncHandler(async (req, res) => {
    const patientId = req.query.patientId;
    if (!patientId) {
        throw new ApiError(400, "Patient id is required");
    }
    const doctorId = req.user?._id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }
    if (doctor.role?.trim() !== "doctor") {
        throw new ApiError(401, "You are not authorized to view patient details");
    }
    const patient = await User.findById(patientId).select("-password -refreshToken");
    if (!patient) {
        throw new ApiError(404, "Patient not found");
    }
    if (patient.role?.trim() !== "user") {
        throw new ApiError(400, "Patient is not a user");
    }
    res
        .status(200)
        .json(new ApiResponse(
            200,
            patient,
            "Patient details fetched successfully"
        ))
})

export const referToAnotherDoctor = asyncHandler(async (req, res) => {

})

export const registerDoctor = asyncHandler(async (req, res) => {
    const {
        userName,
        email,
        phoneNumber,
        firstName,
        lastName,
        address,
        password,
        confirmPassword,
        degree,
        instituteName,
        specialization,
        visitFees
    } = req.body;
    if (
        [
            userName,
            email,
            phoneNumber,
            firstName,
            lastName,
            address,
            password,
            confirmPassword,
            degree,
            instituteName,
            specialization,
            visitFees
        ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const exitedUser = await Doctor.findOne({
        $or: [{ email }, { userName }]
    });
    if (exitedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    if (password !== confirmPassword) {
        throw new ApiError(400, "Password and confirm password should match");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    const licenceLocalPath=req.files?.licence[0]?.path;
    if(!licenceLocalPath){
        throw new ApiError(400, "Licence is required")
    }
    const licence=await uploadPDFOnCloudinary(licenceLocalPath);
    if(!licence.url){
        throw new ApiError(500, "Licence upload failed");
    }

    const specialiazations=specialization.split(',');
    if(specialiazations.length===0){
        throw new ApiError(400, "Specialization is required and also comma seperated");
    }

    const doctor = await Doctor.create({
        userName: userName.toLowerCase(),
        email,
        phoneNumber,
        firstName,
        lastName,
        address,
        password,
        degree,
        instituteName,
        specialiazations,
        visitFees,
        role: "doctor",
        licence: licence.url,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });
    if(!doctor){
        throw new ApiError(500, "Doctor creation failed");
    }
    const createdDoctor = await Doctor.findById(doctor?._id).select("-password -refreshToken");
    if(!createdDoctor){
        throw new ApiError(500, "Something went wrong while creating doctor");
    }
    res
        .status(201)
        .json(new ApiResponse(
            201,
            createdDoctor,
            "Doctor registered successfully"
        ))
})

