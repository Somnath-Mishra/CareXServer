import Stripe from 'stripe'
import conf from '../conf/conf.js';


export class StripeClient {
  stripe;
  stripeSecretKey = conf.stripeSecretAPIKey;
  stripePublicKey = conf.stripePublicAPIKey;
  constructor() {
    this.stripe = new Stripe(this.stripeSecretKey);
  }
  getStripeClient() {
    if (stripe!==null) { return stripe; }
    return { error: "Cannot create Stripe client " };
  }
  applyCharges(fees) {
    stripe.charges.create({
      amount: fees * 100,
      source: stripeTokenId,
      currency: 'usd'
    }).then(function () {
      return true
    }).catch(function () {
      return false;
    });
  }
  async createPaymentIntent(amount) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      
    });
    return paymentIntent;
  }
}

export const stripeClient=new StripeClient();

