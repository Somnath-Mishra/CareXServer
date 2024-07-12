import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createSchedule, deleteSchedule, getScheduleDetails, updateSchedule } from "../controllers/schedule.controller";

const router=Router();
router.use(verifyJWT);

router.route("/create-schedule").post(createSchedule);
router.route("/update-schedule").patch(updateSchedule);
router.route("/delete-schedule").delete(deleteSchedule);
router.route("/get-schedule").get(getScheduleDetails);

export default router;