import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getClientSecretFromStripe, makePaymentByRazorPay, makePaymentByStripe, verifyPaymentByRazorPay } from "../controllers/payment.controller.js";

const router=Router();
router.use(verifyJWT);

router.route('/make-payment-by-razor-pay').post(makePaymentByRazorPay);
router.route("/verify-payment-by-razor-pay").post(verifyPaymentByRazorPay);
router.route("/make-payment-by-stripe").post(makePaymentByStripe);
router.route('/get-client-secret-from-stripe').post(getClientSecretFromStripe);

export default router;