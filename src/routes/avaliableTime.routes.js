import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createAvaliableTime, deleteAvaliableTime, getAvaliableTime } from "../controllers/avaliableTime.controller.js";

const router=Router();
router.use(verifyJWT);

router.route("/create-avaliable-time").post(createAvaliableTime);
router.route("/get-avaliable-time").get(getAvaliableTime);
router.route("/delete-avaliable-time").delete(deleteAvaliableTime);


export default router;