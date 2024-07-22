import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { googleCalendar } from "../utils/googleCalendar.js";
import { Schedule } from "../models/schedule.model.js";
import { Payment } from "../models/payment.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import {
    uploadOnCloudinary,
    uploadPDFOnCloudinary,
} from "../utils/cloudinary.js";

export const markAppointmentAtCalender = async (
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
    patientEmail,
    doctorEmail
) => {
    try {
        if (
            !summary ||
            !description ||
            !year ||
            !month ||
            !day ||
            !hour ||
            !minute ||
            !second ||
            !timeZone ||
            !country ||
            !patientEmail ||
            !doctorEmail
        ) {
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
            patientEmail,
            doctorEmail
        );
        if (!data) {
            throw new ApiError(
                500,
                "Something went wrong while inserting event in google calendar"
            );
        }
        return data;
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while inserting event in google calendar"
        );
    }
};

export const createAppointment = asyncHandler(async (req, res) => {
    const { doctorId, scheduleId, paymentId, timeZone, country } = req.body;
    const patientUserName = req.user?.userName;
    const userId = req.user?._id;

    if (!doctorId || !scheduleId || !paymentId || !timeZone || !country) {
        throw new ApiError(
            400,
            "Missing required fields to create appointment"
        );
    }

    if (!patientUserName || !userId) {
        throw new ApiError(500, "User is not found while creating appointment");
    }

    const scheduleDetails = await Schedule.findById(scheduleId);

    if (!scheduleDetails) {
        throw new ApiError(404, "Schedule details is not valid");
    }

    let emptySlotIndex = scheduleDetails.bookingSlot.findIndex((slot) => slot==null);

    if (emptySlotIndex === -1) {
        throw new ApiError(400, "All slots are booked");
    }

    const paymentDetails = await Payment.findById(paymentId);

    if (!paymentDetails) {
        throw new ApiError(404, "Payment details is not valid");
    }

    const doctorDetails = await Doctor.findById(doctorId);
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor Id is not valid");
    }
    let patientDetails = await User.find({ userName: patientUserName });
    patientDetails = patientDetails[0];
    if (!patientDetails) {
        throw new ApiError(404, "Patient userName is not valid");
    }

    if (!doctorDetails._id.equals(scheduleDetails.doctorId)) {
        throw new ApiError(400, "Doctor and schedule details are not matched");
    }

    scheduleDetails.bookingSlot[emptySlotIndex] = userId;
    await scheduleDetails.save();

    const year = scheduleDetails.startTime.getFullYear();
    const month = scheduleDetails.startTime.getMonth();
    const day = scheduleDetails.startTime.getDate();
    const hour =
        scheduleDetails.startTime.getHours() +
        Math.floor((emptySlotIndex + 1) / 6);
    const minute =
        scheduleDetails.startTime.getMinutes() + (emptySlotIndex % 6) * 10;
    const second = scheduleDetails.startTime.getSeconds();

    const startTime = new Date(year, month - 1, day, hour, minute, second);
    const endTime = new Date(year, month - 1, day, hour, minute + 10, second);

    let location;
    if (scheduleDetails.mode === "online") {
        //TODO: create a google meet link
        location = "https://meet.google.com";
    } else {
        location = scheduleDetails.location;
    }

    const appointmentDetails = await Appointment.create({
        doctor: doctorDetails._id,
        patient: patientDetails._id,
        schedule: scheduleId,
        payment: paymentId,
        startTime: startTime,
        endTime: endTime,
        mode: scheduleDetails.mode,
        location: location,
    });
    if (!appointmentDetails) {
        throw new ApiError(
            500,
            "Something went wrong while inserting appointment details into database"
        );
    }
    const summary =
        "fixes an appointment at " +
        scheduleDetails.mode +
        " with doctor " +
        doctorDetails.name;
    const description =
        "Appointment booked by " +
        patientUserName +
        ". location: " +
        scheduleDetails.location +
        ", start meeting at " +
        scheduleDetails.startTime;
    // const data = await markAppointmentAtCalender(
    //     summary,
    //     description,
    //     year,
    //     month,
    //     day,
    //     hour,
    //     minute,
    //     second,
    //     timeZone,
    //     country,
    //     patientDetails.email,
    //     doctorDetails.email
    // );
    // if (!data) {
    //     throw new ApiError(
    //         500,
    //         "Something went wrong while inserting event in google calendar"
    //     );
    // }
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                appointmentDetails,
                emptySlotIndex,
            },
            "Appointment created successfully"
        )
    );
});

// export const updateAppointmentDetails = asyncHandler(async (req, res) => {
//     const { appointmentId, doctorUserName, scheduleId, timeZone, country } = req.body;
// })

export const cancelAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.body;
    const userId = req.user?._id;
    if (!appointmentId) {
        throw new ApiError(
            400,
            "Missing required fields to cancel appointment"
        );
    }
    const appointmentDetails = await Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    if (
        !appointmentDetails.patient.equals(userId) &&
        !appointmentDetails.doctor.equals(userId)
    ) {
        throw new ApiError(
            403,
            "You are not authorized to cancel this appointment"
        );
    }
    if (appointmentDetails.prescription) {
        //Todo: delete resource from cloudinary
    }
    const scheduleId = appointmentDetails.schedule;
    const scheduleDetails = await Schedule.findById(scheduleId);
    scheduleDetails.bookingSlot[
        scheduleDetails.bookingSlot.findIndex((slot) => slot===userId)
    ] = null;
    await scheduleDetails.save();

    const deletedStatus = await Appointment.findByIdAndDelete(appointmentId);
    if (!deletedStatus) {
        throw new ApiError(
            500,
            "Something went wrong while canceling appointment"
        );
    }
    res.status(200).json(
        new ApiResponse(200, {}, "Appointment canceled successfully")
    );
});

export const getAppointmentDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(400, "User is not found");
    }

    const upcomingAppointments = await Appointment.aggregate([
        {
            $match: {
                $or: [{ patient: userId }, { doctor: userId }],
            },
        },
        {
            $match: {
                startTime: {
                    $gt: new Date(),
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "doctor",
                foreignField: "_id",
                as: "doctorDetails",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "patient",
                foreignField: "_id",
                as: "patientDetails",
            },
        },
        {
            $unwind: {
                path: "$doctorDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$patientDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                // doctor: 1,
                // patient: 1,
                startTime: 1,
                endTime: 1,
                mode: 1,
                location: 1,
                doctorFirstName: "$doctorDetails.firstName",
                doctorLastName: "$doctorDetails.lastName",
                patientFirstName: "$patientDetails.firstName",
                patientLastName: "$patientDetails.lastName",
            },
        },
    ]);

    if (upcomingAppointments.length === 0) {
        res.status(200).json(
            new ApiResponse(200, {}, "No upcoming appointments found")
        );
    }

    res.status(200).json(
        new ApiResponse(
            200,
            upcomingAppointments,
            "Upcoming appointments fetched successfully"
        )
    );
});

export const addPrescription = asyncHandler(async (req, res) => {
    const { appointmentId } = req.body;
    if (!appointmentId) {
        throw new ApiError(
            400,
            "Appointment id is required for linking prescription"
        );
    }
    const user = req.user;
    const appointmentDetails = await Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }

    if (
        (!user._id.equals(appointmentDetails.doctor)) &&
        (user.role.trim().toLowerCase() !== "doctor")
    ) {
        throw new ApiError(403, "You are not authorized to add prescription");
    }

    const prescriptionLocalPath = req.file?.path;
    if (!prescriptionLocalPath) {
        throw new ApiError(400, "Prescription is not uploaded");
    }
    const prescription = await uploadPDFOnCloudinary(prescriptionLocalPath);
    if (!prescription.url) {
        throw new ApiError(
            500,
            "Something went wrong while uploading prescription"
        );
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
            prescription: prescription.url,
        },
        {
            new: true,
        }
    );
    if (!updatedAppointment) {
        throw new ApiError(
            500,
            "Something went wrong while updating appointment with prescription"
        );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedAppointment,
                "Prescription added successfully"
            )
        );
});

export const getPrescription = asyncHandler(async (req, res) => {
    const appointmentId = req.query.appointmentId;
    if (!appointmentId) {
        throw new ApiError(
            400,
            "Appointment id is required for fetching prescription"
        );
    }
    const appointmentDetails = await Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    if (!appointmentDetails.prescription) {
        throw new ApiError(
            404,
            "Prescription is not found for this appointment"
        );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                appointmentDetails.prescription,
                "Prescription fetched successfully"
            )
        );
});
// export const deletePrescription = asyncHandler(async (req, res) => {

// })
export const addPaymentDetails = asyncHandler(async (req, res) => {
    const { paymentId, appointmentId } = req.body;
    if (!paymentId) {
        throw new ApiError(
            400,
            "Payment id is required for adding payment details"
        );
    }
    if (!appointmentId) {
        throw new ApiError(
            400,
            "Appointment id is required for adding payment details"
        );
    }
    const paymentDetails = Payment.findById(paymentId);
    if (!paymentDetails) {
        throw new ApiError(404, "Payment is not found");
    }
    const appointmentDetails = Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
            payment: paymentId,
        },
        {
            new: true,
        }
    );
    if (!updatedAppointment) {
        throw new ApiError(
            500,
            "Something went wrong while updating appointment with payment details"
        );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedAppointment,
                "Payment details added successfully"
            )
        );
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { appointmentStatus, appointmentId } = req.body;
    if (!appointmentStatus || !appointmentId) {
        throw new ApiError(
            400,
            "Missing required fields to update appointment status"
        );
    }
    const appointmentDetails = await Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
            status: appointmentStatus,
        },
        {
            new: true,
        }
    );
    if (!updateAppointmentStatus) {
        throw new ApiError(
            500,
            "Something went wrong while updating appointment status"
        );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedAppointment,
                "Appointment status updated successfully"
            )
        );
});

export const getAppointmentHistory = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const appointmentHistory = await Appointment.aggregate([
        {
            $match: {
                $or: [{ patient: userId }, { doctor: userId }],
            },
        },
        {
            $match: {
                startTime: {
                    $lt: new Date(),
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "doctor",
                foreignField: "_id",
                as: "doctorDetails",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "patient",
                foreignField: "_id",
                as: "patientDetails",
            },
        },
        {
            $unwind: {
                path: "$doctorDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$patientDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                // doctor: 1,
                // patient: 1,
                // schedule: 1,
                // payment: 1,
                startTime: 1,
                endTime: 1,
                mode: 1,
                location: 1,
                doctorFirstName: "$doctorDetails.firstName",
                doctorLastName: "$doctorDetails.lastName",
                patientFirstName: "$patientDetails.firstName",
                patientLastName: "$patientDetails.lastName",
            },
        },
    ]);
    if (!appointmentHistory) {
        throw new ApiError(404, "No appointments history found");
    }
    res.status(200).json(
        new ApiResponse(
            200,
            appointmentHistory,
            "Appointment history fetched successfully"
        )
    );
});
