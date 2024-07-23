import { Admin } from "../models/admin.model.js";
import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyDoctorDetailsAndActivateOrRejected = asyncHandler(async (req, res) => {
    const { doctorId, isActivate } = req.body;
    if (!doctorId || !isActivate) {
        res.status(400)
        throw new Error("Please provide doctorId and isActivate status")
    }
    const adminId = req.user?._id;
    const adminDetails = await Admin.findById(adminId);
    if (!adminDetails) {
        throw new ApiError(404, "Admin not found");
    }
    const doctorDetails = await Doctor.findById(doctorId);
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor not found");
    }
    const updatedDoctorDetails = await Doctor.findByIdAndUpdate(doctorId, {
        isActive: isActivate
    }, { new: true });
    if (!updatedDoctorDetails) {
        throw new ApiError(500, "Something went wrong while updating doctor details");
    }
    res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedDoctorDetails,
            "Doctor details updated successfully"
        ))
})

export const registerAdmin = asyncHandler(async (req, res) => {
    const {
        userName,
        email,
        phoneNumber,
        firstName,
        lastName,
        address,
        password,
        confirmPassword,
        adminType,
    } = req.body;

    // Check if all required fields are provided
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
            adminType,
        ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        throw new ApiError(400, "Password and confirm password should be same");
    }

    // Check if user with the same email or username already exists
    const existingUser = await Admin.findOne({
        $or: [{ email }, { userName }],
    });
    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Handle avatar upload
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    // Handle cover image upload
    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    // Create the admin user
    const admin = await Admin.create({
        userName: userName.toLowerCase(),
        email,
        phoneNumber,
        firstName,
        lastName,
        address,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        adminType,
        role: "admin",
    });

    // Select created admin details excluding password and refreshToken
    const createdAdmin = await Admin.findById(admin._id).select(
        "-password -refreshToken"
    );
    if (!createdAdmin) {
        throw new ApiError(500, "Admin creation failed");
    }

    // Return response
    return res
        .status(201)
        .json(
            new ApiResponse(201, createdAdmin, "Admin registered successfully")
        );
});