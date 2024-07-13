import { Admin } from "../models/admin.model.js";
import { Doctor } from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
        isVerified: isActivate
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