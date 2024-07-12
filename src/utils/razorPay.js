import Razorpay from 'razorpay';
import conf from '../conf/conf.js';

export class RazorPayClient {
    razorPaySecret = conf.razorpayKeySecret;
    razorPayKeyId = conf.razorpayKeyID;
    razorPayInstance;
    orderId;
    constructor() {
        this.razorPayInstance = new Razorpay({
            key_id: this.razorPayKeyId,
            key_secret: this.razorPaySecret
        });
    }
    async createOrder(amount) {
        let order = await razorPayInstance.orders.create({
            amount: amount * 100,
            currency: "USD",
            receipt: "receipt#1"
        })
        this.orderId = order.id;
        const orderPayload = {
            success: true,
            order: order,
            amount: amount
        }
        return orderPayload;
    }
    validateOrder(razorpay_payment_id,razorpay_signature) {
        const generated_signature = hmac_sha256(orderId + "|" + razorpay_payment_id, razorpayKeySecret);
        if (generated_signature === razorpay_signature) {
            return true;
        }
        else return false;
    }

}

export const razorPayClient=new RazorPayClient();