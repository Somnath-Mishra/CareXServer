import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createAppointment } from "../controllers/appointment.controller";

const router=Router();
router.use(verifyJWT);

router.route('/create-appointment').post(createAppointment);

export default router;