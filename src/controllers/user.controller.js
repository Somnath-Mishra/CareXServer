import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import conf from "../conf/conf.js";
import jwt from "jsonwebtoken";
import { googleCalendar } from "../utils/googleCalendar.js";
import { medicalSpecializations } from "./medicalSpecialization.js";
import { findSpecialization } from "../utils/patientProblemWithSpecialization.js";
import { findDoctors } from "../db/SearchDatabase/problemMapWithSpecilization.mjs";
import { razorPayClient } from "../utils/razorPay.js";
import { stripeClient } from "../utils/stripe.js";

//Find specific doctor according to their specialization who might resolve
//problem of the patient
export const findDoctor = asyncHandler(async (req, res) => {
    const searchResult = req.query.searchResult;//searchResult is problem of user

    if (searchResult?.trim() === "") {
        throw new ApiError(400, "Empty search result");
    }

    //medicalSpecializations is an array of possible specialization which is certified
    //this is convert all speciliazation to a string seperated by single space

    let specialization = medicalSpecializations.map(specialization => specialization.name).join(" ");

    //mapping problem with specialization
    const requiredSpecifications = await findSpecialization(searchResult, specialization);

    if (requiredSpecifications?.trim() === "") {
        requiredSpecifications = "Emergency Medicine"
    }

    //fetched details of doctors who can solve problem 
    const doctors = await findDoctors(requiredSpecifications);

    if (!doctors) {
        throw new ApiError(404, "Doctor not found");
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            doctors,
            "Doctor fetched successfully",
        )
    );
})



export const markAppointmentAtCalender = asyncHandler(async (req, res) => {
    const {
        summary,
        description,
        year,
        month,
        day,
        hour,
        minute,
        second,
        timeZone,
        country,
        patientUserName,
        doctorUserName
    } = req.body;

    if (!summary || !description || !year || !month || !day || !hour || !minute || !second || !timeZone || !country || !patientUserName || !doctorUserName) {
        throw new ApiError(400, "Missing required fields");
    }

    const data = await googleCalendar.bookAnAppointmentInCalendar(
        summary,
        description,
        year,
        month,
        day,
        hour,
        minute,
        second,
        timeZone,
        country,
        patientUserName,
        doctorUserName
    );
    if (!data) {
        throw new ApiError(500, "Something went wrong while inserting event in google calendar");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                data,
                "Appointment booked successfully",
            )
        );
})

// export async function confirmBookByStripe(req, res) {
//     const { doctorId, stripeTokenId } = req.body;
//     try {
//         const doctor = await Doctor.findById(doctorId);
//         if (!doctor) {
//             return res.status(404).json({
//                 success: true,
//                 message: "Internal server error"
//             });
//         }

//         const fees = doctor.fees;
//         stripeClient.applyCharges(fees, stripeTokenId);
//     }
//     catch (error) {
//         console.error("Error occured at confirmBook() fileName user.controller.js : ", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         })
//     }
// }

// export function makePaymentByRazorPay(req, res) {
//     const { amount } = req.body;
//     try {
//         const orderPayload = razorPayClient.createOrder(amount);
//         res.status(201).json(orderPayload);
//     } catch (error) {
//         console.error("Error occured at makePaymentByRazorPay() fileName user.controller.js : ", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         })
//     }
// }

// export async function initiatePaymentByStripe(req, res) {
//     let { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
//     // Validate request body
//     if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
//         return res.status(400).json({ error: 'Missing required fields' });
//     }
//     try {
//         const isValidPayment = razorPayClient.validateOrder(razorpay_payment_id, razorpay_signature);

//         if (!isValidPayment) {
//             return res.status(400).json({ error: 'Invalid signature' });
//         }

//         // Fetch the payment details from Razorpay
//         const payment = await razorPayClient.payments.fetch(razorpay_payment_id);

//         if (payment.status === 'captured') {
//             // Handle successful payment
//             res.status(200).json({ message: 'Payment successful', payment });
//         } else {
//             // Handle payment failure or pending status
//             res.status(400).json({ error: 'Payment not successful', payment });
//         }
//     } catch (error) {
//         // Log the error for debugging
//         console.error('Error verifying payment:', error);

//         // Respond with an error message
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }

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


export const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, phoneNumber, firstName, lastName, address, password } = req.body;
    if (
        [userName, email, phoneNumber, firstName, lastName, address, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const exitedUser = await User.findOne({
        $or: [{ email }, { userName }]
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
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
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
    )
    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }
    return res.
        status(201)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));

})

export const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return {
            accessToken,
            refreshToken,
        }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

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
        $or: [{ email }, { userName }]
    });
    if (!user) {
        throw new ApiError(404, "User does not exits");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "User logged in successfully"));

})

export const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true//options to return updated document
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || null;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        conf.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(404, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired");
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            accessToken,
            refreshToken
        }, "Access token refreshed successfully"))

})

export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;
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
})

export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
})

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { firstName, lastName, address, email, phoneNumber } = req.body;
    if (!firstName || !lastName || !address || !email || !phoneNumber) {
        throw new ApiError(400, "All fields are required");
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                firstName,
                lastName,
                address,
                email,
                phoneNumber
            },
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(500, "Something went wrong while updating account details");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));

})

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
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(500, "Something went wrong while updating avatar in database");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
})

export const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(500, "Something went wrong while uploading cover image");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(500, "Something went wrong while updating cover image in database");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"));
})

export const makePaymentByRazorPay=asyncHandler(async(req,res)=>{
    const {amount}=req.body;
    if(!amount){
        throw new ApiError(400, "Amount is required");
    }

    const orderPayload=razorPayClient.createOrder(amount);
    if(!orderPayload){
        throw new ApiError(500, "Something went wrong while creating order through Razor Pay");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, orderPayload, "Order created successfully by Razor Pay"));
})

export const verifyPaymentByRazorPay=asyncHandler(async(req, res)=>{
    const {razorpay_payment_id,razorpay_signature}=req.body;
    if(!razorpay_payment_id || !razorpay_signature){
        throw new ApiError(400, "Razor Pay payment id and signature are required");
    }
    const paymentStatus=razorPayClient.validateOrder(razorpay_payment_id,razorpay_signature);
    if(!paymentStatus){
        throw new ApiError(400, "Payment verification failed");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Payment verified successfully by Razor Pay"));
})

export const makePaymentByStripe=asyncHandler(async(req,res)=>{
    const {amount,stripeTokenId}=req.body;
    if(!amount || !stripeTokenId){
        throw new ApiError(400, "Amount and Stripe token id are required");
    }
    const paymentStatus=stripeClient.applyCharges(amount,stripeTokenId);
    if(!paymentStatus){
        throw new ApiError(400, "Payment failed through stripe");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Payment made successfully through stripe"));
})