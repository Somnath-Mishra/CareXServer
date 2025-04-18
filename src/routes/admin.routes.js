import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    registerAdmin,
    verifyDoctorDetailsAndActivateOrRejected,
} from "../controllers/admin.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
        
    ]),
    registerAdmin
);

router.use(verifyJWT);

router
    .route("/verify-doctor-details")
    .patch(verifyDoctorDetailsAndActivateOrRejected);

export default router;
