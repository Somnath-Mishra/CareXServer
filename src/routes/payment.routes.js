import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { makePaymentByRazorPay, makePaymentByStripe, verifyPaymentByRazorPay } from "../controllers/payment.controller.js";

const router=Router();
router.use(verifyJWT);

router.route('/make-payment-by-razor-pay').post(makePaymentByRazorPay);
router.route("/verify-payment-by-razor-pay").post(verifyPaymentByRazorPay);
router.route("/make-payment-by-stripe").post(makePaymentByStripe);

export default router;