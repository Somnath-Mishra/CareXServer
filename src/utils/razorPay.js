import Razorpay from 'razorpay';
import conf from '../conf/conf.js';
import crypto from 'crypto';

export class RazorPayClient {
    constructor() {
        this.razorPaySecret = conf.razorpayKeySecret;
        this.razorPayKeyId = conf.razorpayKeyID;
        this.razorPayInstance = new Razorpay({
            key_id: this.razorPayKeyId,
            key_secret: this.razorPaySecret
        });
    }

    async createOrder(amount) {
        try {
            let order = await this.razorPayInstance.orders.create({
                amount: amount * 100, // amount in smallest currency unit
                currency: "USD",
                receipt: "receipt#1"
            });
            this.orderId = order.id;
            const orderPayload = {
                success: true,
                order: order,
                amount: amount
            };
            return orderPayload;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error; // rethrow the error after logging it
        }
    }

    validateOrder(razorpay_payment_id, razorpay_signature) {
        try {
            const generated_signature = crypto.createHmac('sha256', this.razorPaySecret)
                .update(this.orderId + "|" + razorpay_payment_id)
                .digest('hex');
            return generated_signature === razorpay_signature;
        } catch (error) {
            console.error('Error validating order:', error);
            throw error; // rethrow the error after logging it
        }
    }
}

export const razorPayClient = new RazorPayClient();
