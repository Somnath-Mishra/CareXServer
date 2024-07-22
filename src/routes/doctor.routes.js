import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getPatientDetails, registerDoctor, uploadDoctorSpecificDetails } from "../controllers/doctor.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
const router=Router();

router.route('/doctor-register').post(
    upload.fields([
      {
        name: "avatar",
        maxCount: 1
      },
      {
        name: "coverImage",
        maxCount: 1
      },
      {
        name:"licence",
        maxCount:1
      }
    ]),
    registerDoctor
  );

// router.use(verifyJWT);

router.route("/upload-doctor-specific-details").post(verifyJWT,uploadDoctorSpecificDetails);
router.route("/get-patient-details").get(verifyJWT,getPatientDetails);


export default router;