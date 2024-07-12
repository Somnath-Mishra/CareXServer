import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { googleCalendar } from "../utils/googleCalendar.js"

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