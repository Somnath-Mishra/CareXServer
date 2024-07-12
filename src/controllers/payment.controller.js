import { asyncHandler } from "../utils/asyncHandler.js";
import { razorPayClient } from "../utils/razorPay.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Payment } from "../models/payment.model.js";

export const makePaymentByRazorPay = asyncHandler(async (req, res) => {
    const { amount, appointmentId, doctorId } = req.body;
    if (!amount) {
        throw new ApiError(400, "Amount is required");
    }

    if (!appointmentId || !doctorId) {
        throw new ApiError(400, "Appointment Id and Doctor Id are required");
    }

    const appointmentDetails = await Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    const doctorDetails = await Doctor.findById(doctorId);
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor is not found");
    }


    const orderPayload = razorPayClient.createOrder(amount);
    if (!orderPayload) {
        throw new ApiError(500, "Something went wrong while creating order through Razor Pay");
    }

    const paymentDetails = await Payment.create({
        user: req.user._id,
        doctor: doctorId,
        amount: amount,
        currency: orderPayload.currency,
        paymentMethod: "RazorPay",
        paymentStatus: "success",
        paymentReferrence: orderPayload.id
    })

    if (!paymentDetails) {
        throw new ApiError(500, "Something went wrong while inserting payment details in database");
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, {
        payment: paymentDetails._id
    })

    if (!updatedAppointment) {
        throw new ApiError(500, "Something went wrong while updating appointment with payment details");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { paymentDetails, appointmentDetails }, "Order created successfully by Razor Pay"));
})

export const verifyPaymentByRazorPay = asyncHandler(async (req, res) => {
    const { razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "Razor Pay payment id and signature are required");
    }
    const paymentStatus = razorPayClient.validateOrder(razorpay_payment_id, razorpay_signature);
    if (!paymentStatus) {
        throw new ApiError(400, "Payment verification failed");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Payment verified successfully by Razor Pay"));
})

export const makePaymentByStripe = asyncHandler(async (req, res) => {
    const { amount, stripeTokenId, appointmentId, doctorId } = req.body;
    if (!amount || !stripeTokenId) {
        throw new ApiError(400, "Amount and Stripe Token Id are required");
    }
    if (!appointmentId || !doctorId) {
        throw new ApiError(400, "Appointment Id and Doctor Id are required");
    }
    const appointmentDetails = await Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    const doctorDetails = await Doctor.findById(doctorId);
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor is not found");
    }

    const paymentStatus = stripeClient.applyCharges(amount, stripeTokenId);
    if (!paymentStatus) {
        throw new ApiError(400, "Payment failed through stripe");
    }
    const paymentDetails = await Payment.create({
        user: req.user._id,
        doctor: doctorId,
        amount: amount,
        currency: "USD",
        paymentMethod: "Stripe",
        paymentStatus: "success",
        paymentReferrence: paymentStatus.id
    })
    if (!paymentDetails) {
        throw new ApiError(500, "Something went wrong while inserting payment details in database");
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, {
        payment: paymentDetails._id
    })
    if (!updatedAppointment) {
        throw new ApiError(500, "Something went wrong while updating appointment with payment details");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { paymentDetails, appointmentDetails }, "Payment made successfully through stripe"));
})

export const downloadInvoicePDF = asyncHandler(async (req, res) => {

})

export const updatePaymentStatus = asyncHandler(async (req, res) => {

})

export const getPaymentDetails = asyncHandler(async (req, res) => {

})

export const refundPaymentToUser = asyncHandler(async (req, res) => {

})

export const payFeesToDoctor = asyncHandler(async (req, res) => {

})