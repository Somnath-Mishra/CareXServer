import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import conf from "../conf/conf.js";
import jwt from "jsonwebtoken";
import { medicalSpecializations } from "./medicalSpecialization.js";
import { findSpecialization } from "../utils/patientProblemWithSpecialization.js";
import {
    findDoctors,
    getUniqueSpecializations,
} from "../db/SearchDatabase/problemMapWithSpecilization.mjs";
import { Doctor } from "../models/doctor.model.js";
import { get } from "mongoose";
//Find specific doctor according to their specialization who might resolve
//problem of the patient
export const findDoctor = asyncHandler(async (req, res) => {
    const searchResult = req.query.searchResult; //searchResult is problem of user

    if (searchResult?.trim() === "") {
        throw new ApiError(400, "Empty search result");
    }

    //medicalSpecializations is an array of possible specialization which is certified
    //this is convert all speciliazation to a string seperated by single space

    let specialization = medicalSpecializations
        .map((specialization) => specialization.name)
        .join(" ");

    //mapping problem with specialization
    const requiredSpecifications = await findSpecialization(
        searchResult,
        specialization
    );

    if (requiredSpecifications?.trim() === "") {
        requiredSpecifications = "Emergency Medicine";
    }

    //fetched details of doctors who can solve problem
    const doctors = await findDoctors(requiredSpecifications);

    if (!doctors) {
        throw new ApiError(404, "Doctor not found");
    }

    res.status(200).json(
        new ApiResponse(200, doctors, "Doctor fetched successfully")
    );
});

// export async function getAllDiseaseName(req,res){
//     try{
//         const specialization=await getUniqueSpecializations();
//         return res.status(200).json(specialization);
//     }
//     catch(error){
//         console.error("Error occured at getAllDiseaseName() fileName user.controller.js : ", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         })
//     }
// }

export const getAllDiseaseName = asyncHandler(async (req, res) => {
    const specialization = await getUniqueSpecializations();
    if (!specialization) {
        throw new ApiError(404, "Specialization not found");
    }
    res.status(200).json(
        new ApiResponse(
            200,
            specialization,
            "Specialization fetched successfully"
        )
    );
});

export const registerUser = asyncHandler(async (req, res) => {
    const {
        userName,
        email,
        phoneNumber,
        firstName,
        lastName,
        address,
        password,
        confirmPassword,
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
        ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    if (password !== confirmPassword) {
        throw new ApiError(400, "Password and confirm password should be same");
    }
    const exitedUser = await User.findOne({
        $or: [{ email }, { userName }],
    });
    if (exitedUser) {
        throw new ApiError(409, "User with email or username already exists");
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

    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        phoneNumber,
        firstName,
        lastName,
        address,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

export const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return {
            accessToken,
            refreshToken,
        };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating refresh and access token"
        );
    }
};

export const loginUser = asyncHandler(async (req, res) => {
    const { email, userName, password, confirmPassword } = req.body;
    if (!(userName || email)) {
        throw new ApiError(400, "Email or username is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }
    if (password !== confirmPassword) {
        throw new ApiError(400, "Password and confirm password must match");
    }
    const user = await User.findOne({
        $or: [{ email }, { userName }],
    });
    if (!user) {
        throw new ApiError(404, "User does not exits");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken: null,
            },
        },
        {
            new: true, //options to return updated document
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken || null;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        conf.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(404, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired");
    }
    const options = {
        httpOnly: true,
        secure: true,
    };
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken,
                },
                "Access token refreshed successfully"
            )
        );
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new ApiError(400, "All password fields are required");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "New password and confirm password must match");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { firstName, lastName, address, email, phoneNumber } = req.body;
    if (!firstName || !lastName || !address || !email || !phoneNumber) {
        throw new ApiError(400, "All fields are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                firstName,
                lastName,
                address,
                email,
                phoneNumber,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(
            500,
            "Something went wrong while updating account details"
        );
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

export const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(500, "Something went wrong while uploading avatar");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(
            500,
            "Something went wrong while updating avatar in database"
        );
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

export const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(
            500,
            "Something went wrong while uploading cover image"
        );
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(
            500,
            "Something went wrong while updating cover image in database"
        );
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

export const getDoctorDetails = asyncHandler(async (req, res) => {
    const { doctorId } = req.body;
    if (!doctorId) {
        throw new ApiError(400, "Please provide doctorId");
    }
    const doctor = await Doctor.findById(doctorId).select(
        "-password -refreshToken"
    );
    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }
    res.status(200).json(
        new ApiResponse(200, doctor, "Doctor details fetched successfully")
    );
});

export const getDoctorDetailsToSolvePatientProblem = asyncHandler(
    async (req, res) => {
        const { patientProblems } = req.body;
        if (!patientProblems) {
            throw new ApiError(400, "Please provide patient problems");
        }
        let getUniqueSpecialization = await Doctor.aggregate([
            {
                $unwind: "$specialization",
            },
            {
                $group: {
                    _id: null,
                    uniqueSpecializations: { $addToSet: "$specialization" },
                },
            },
            {
                $project: {
                    _id: 0,
                    specializations: {
                        $reduce: {
                            input: "$uniqueSpecializations",
                            initialValue: "",
                            in: {
                                $cond: {
                                    if: { $eq: ["$$value", ""] },
                                    then: "$$this",
                                    else: {
                                        $concat: ["$$value", ", ", "$$this"],
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ]);

        getUniqueSpecialization = getUniqueSpecialization[0]?.specializations;
        if (!getUniqueSpecialization) {
            throw new ApiError(
                500,
                "Something went wrong while fetching unique specialization"
            );
        }
        let specializations = await findSpecialization(
            patientProblems,
            getUniqueSpecialization
        );
        if (!specializations) {
            throw new ApiError(
                500,
                "Something went wrong while finding specialiazation from genAI"
            );
        }
        specializations = specializations.split(",").map(s=>s.trim());

        const doctors = await Doctor.aggregate([
            {
                $match: {
                    specialization: { $in: specializations },
                },
            },
            {
                $addFields: {
                    doctorId: "$_id",
                },
            },
            {
                $group: {
                    _id: "$doctorId",
                    details: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$details",
                },
            },
            {
                $project: {
                    password: 0,
                    refreshToken: 0,
                },
            },
        ]);



        if (!doctors) {
            throw new ApiError(404, "Doctor not found");
        }
        res.status(200).json(
            new ApiResponse(200, doctors, "Doctor fetched successfully")
        );
    }
);
