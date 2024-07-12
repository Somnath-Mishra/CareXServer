import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addPaymentDetails, addPrescription, cancelAppointment, createAppointment, getAppointmentDetails, getPrescription, updateAppointmentStatus } from "../controllers/appointment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router();
router.use(verifyJWT);

router.route('/create-appointment').post(createAppointment);
router.route("/cancel-appointment").delete(cancelAppointment);
router.route("/get-appointment-details").get(getAppointmentDetails);
router.route("/add-prescription").post(upload.single("prescription"),addPrescription);
router.route("/get-prescription").get(getPrescription);
router.route("/add-payment-details").post(addPaymentDetails);
router.route("update-appointment-status").post(updateAppointmentStatus);


export default router;