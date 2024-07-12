import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { googleCalendar } from "../utils/googleCalendar.js"
import { Schedule } from "../models/schedule.model.js";
import { Payment } from "../models/payment.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.mjs";
import { User } from "../models/user.model.js";
import { Appointment } from "../models/appointment.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const markAppointmentAtCalender = async (summary,
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
    doctorEmail) => {
    try {
        if (!summary || !description || !year || !month || !day || !hour || !minute || !second || !timeZone || !country || !patientEmail || !doctorEmail) {
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
            throw new ApiError(500, "Something went wrong while inserting event in google calendar");
        }
        return data;
    } catch (error) {
        throw new ApiError(500, "Something went wrong while inserting event in google calendar");
    }
}

export const createAppointment = asyncHandler(async (req, res) => {
    const { doctorUserName, scheduleId, paymentId, timeZone, country } = req.body;
    const patientUserName = req.user?.userName;

    if (!doctorUserName || !scheduleId || !paymentId || !timeZone || !country) {
        throw new ApiError(400, "Missing required fields to create appointment");
    }

    if (!patientUserName) {
        throw new ApiError(500, "User is not found while creating appointment");
    }

    const scheduleDetails = Schedule.findById(scheduleId);
    const paymentDetails = Payment.findById(paymentId);
    const doctorDetails = Doctor.find({
        userName: doctorUserName
    })
    const patientDetails = User.find({ userName: patientUserName });
    if (!patientDetails) {
        throw new ApiError(404, "Patient userName is not valid");
    }
    if (!doctorDetails) {
        throw new ApiError(404, "Doctor userName is not valid");
    }
    if (!scheduleDetails) {
        throw new ApiError(404, "Schedule details is not valid");
    }
    if (!paymentDetails) {
        throw new ApiError(404, "Payment details is not valid");
    }
    if (doctorDetails._id !== scheduleDetails.doctorId) {
        throw new ApiError(400, "Doctor and schedule details are not matched");
    }
    const appointmentDetails = await Appointment.create({
        doctor: doctorUserName,
        patient: patientUserName,
        schedule: scheduleId,
        payment: paymentId
    });
    if (!appointmentDetails) {
        throw new ApiError(500, "Something went wrong while inserting appointment details into database");
    }
    const summary = "fixes an appointment at " + scheduleDetails.mode + " with doctor " + doctorDetails.name;
    const description = "Appointment booked by " + patientUserName + ". location: " + scheduleDetails.location + ", start meeting at " + scheduleDetails.startTime;
    const year = scheduleDetails.startTime.getFullYear();
    const month = scheduleDetails.startTime.getMonth();
    const day = scheduleDetails.startTime.getDate();
    const hour = scheduleDetails.startTime.getHours();
    const minute = scheduleDetails.startTime.getMinutes();
    const second = scheduleDetails.startTime.getSeconds();
    const data = await markAppointmentAtCalender(
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
        patientDetails.email,
        doctorDetails.email
    );
    if (!data) {
        throw new ApiError(500, "Something went wrong while inserting event in google calendar");
    }
    return res
        .status(200)
        .json(
            200,
            new ApiResponse(
                appointmentDetails,
                "Appointment created successfully",
            )
        )
})

// export const updateAppointmentDetails = asyncHandler(async (req, res) => {
//     const { appointmentId, doctorUserName, scheduleId, timeZone, country } = req.body;
// })

export const cancelAppointment = asyncHandler(async (req, res) => {
    const { appointmentId } = req.body;
    const userId = req.user?._id;
    if (!appointmentId) {
        throw new ApiError(400, "Missing required fields to cancel appointment");
    }
    const appointmentDetails = await Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    if (appointmentDetails.patient !== userId && appointmentDetails.doctor !== userId) {
        throw new ApiError(403, "You are not authorized to cancel this appointment");
    }
    if (appointmentDetails.prescription) {
        //Todo: delete resource from cloudinary
    }

    const deletedStatus = await Appointment.findByIdAndDelete(appointmentId);
    if (!deletedStatus) {
        throw new ApiError(500, "Something went wrong while canceling appointment");
    }
    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Appointment canceled successfully",
            )
        )

})

export const getAppointmentDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const upcomingAppointmentsOfPatient = await Appointment.aggregate([
        {
            $match: {
                patient: userId,
            }
        },
        {
            $lookup: {
                from: "schedules",
                localField: "schedule",
                foreignField: "_id",
                as: "scheduleDetails"
            }
        },
        {
            $unwind: "$scheduleDetails"
        },
        {
            $match: {
                "scheduleDetails.startTime": {
                    $gt: new Date()
                }
            }
        }
    ])
    const upcomingAppointmentsOfDoctor = await Appointment.aggregate([
        {
            $match: {
                doctor: userId,
            }
        },
        {
            $lookup: {
                from: "schedules",
                localField: "schedule",
                foreignField: "_id",
                as: "scheduleDetails"
            }
        },
        {
            $unwind: "$scheduleDetails"
        },
        {
            $match: {
                "scheduleDetails.startTime": {
                    $gt: new Date()
                }
            }
        }
    ])
    const upcomingAppointments = [...upcomingAppointmentsOfPatient, ...upcomingAppointmentsOfDoctor];
    if (!upcomingAppointments) {
        throw new ApiError(404, "No upcoming appointments found");
    }
    res
        .status(200)
        .json(
            new ApiResponse(
                upcomingAppointments,
                "Upcoming appointments fetched successfully",
            )
        )
})

export const addPrescription = asyncHandler(async (req, res) => {
    const { appointmentId } = req.body;
    if (!appointmentId) {
        throw new ApiError(400, "Appointment id is required for linking prescription");
    }
    const appointmentDetails = Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    const prescriptionLocalPath = req.file?.path;
    if (!prescriptionLocalPath) {
        throw new ApiError(400, "Prescription is not uploaded");
    }
    const prescription = await uploadOnCloudinary(prescriptionLocalPath);
    if (!prescription.url) {
        throw new ApiError(500, "Something went wrong while uploading prescription");
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, {
        prescription: prescription.url
    })
    if (!updatedAppointment) {
        throw new ApiError(500, "Something went wrong while updating appointment with prescription");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedAppointment,
                "Prescription added successfully",
            )
        )

})

export const getPrescription = asyncHandler(async (req, res) => {
    const { appointmentId } = req.body;
    if (!appointmentId) {
        throw new ApiError(400, "Appointment id is required for fetching prescription");
    }
    const appointmentDetails = Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    if (!appointmentDetails.prescription) {
        throw new ApiError(404, "Prescription is not found for this appointment");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                appointmentDetails.prescription,
                "Prescription fetched successfully",
            )
        )
})
// export const deletePrescription = asyncHandler(async (req, res) => {

// })
export const addPaymentDetails = asyncHandler(async (req, res) => {
    const { paymentId, appointmentId } = req.body;
    if (!paymentId) {
        throw new ApiError(400, "Payment id is required for adding payment details");
    }
    if (!appointmentId) {
        throw new ApiError(400, "Appointment id is required for adding payment details");
    }
    const paymentDetails = Payment.findById(paymentId);
    if (!paymentDetails) {
        throw new ApiError(404, "Payment is not found");
    }
    const appointmentDetails = Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, {
        payment: paymentId
    })
    if (!updatedAppointment) {
        throw new ApiError(500, "Something went wrong while updating appointment with payment details");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedAppointment,
                "Payment details added successfully",
            )
        )

})

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { appointmentStatus, appointmentId } = req.body;
    if (!appointmentStatus || !appointmentId) {
        throw new ApiError(400, "Missing required fields to update appointment status");
    }
    const appointmentDetails = await Appointment.findById(appointmentId);
    if (!appointmentDetails) {
        throw new ApiError(404, "Appointment is not found");
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, {
        status: appointmentStatus
    })
    if (!updateAppointmentStatus) {
        throw new ApiError(500, "Something went wrong while updating appointment status");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedAppointment,
                "Appointment status updated successfully",
            )
        )
})