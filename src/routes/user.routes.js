import { Router } from "express";
import {  changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controller.js";
// import { medicalSpecializations } from "../controllers/medicalSpecialization.js";
// import { Doctor } from "../models/doctor.mjs";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
  upload.fields([
    {
      name:"avatar",
      maxCount:1
    },
    {
      name:"coverImage",
      maxCount:1
    }
  ]),
  registerUser
);
router.route('/login').post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").get(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);


// router.route("/home")
//   .get()

// router.route("/getAllDiseaseList")
//   .get(
//     getAllDiseaseName
//   )
//   .post()

// router.route("/:userId")
//   .get()
//   .post()

// router.route("/problem")
//   .get(findDoctor)
//   .post(

// )

// router.route("/blog")
//   .get()


// router.route("/history")
//   .get()


// router.route("/doctorSuggestion")
//   .get(

// )


// router.route("/bookAppointment")
//   .get()
//   .post()

// router.route("/payment")
//   .post()

// router.route("/confirmBook")
//   .post()


export default router;