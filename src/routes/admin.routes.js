import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyDoctorDetailsAndActivateOrRejected } from "../controllers/admin.controller.js";

const router=Router();
router.use(verifyJWT);

router.route('/verify-doctor-details').patch(verifyDoctorDetailsAndActivateOrRejected);

export default router;