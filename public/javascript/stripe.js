class StripeClient {
  doctorId;
  stripeHandler;
  stripePublicKey = "pk_test_51OnkzpSGKgFmrVkvBljgILktH5432upsm1aW1fiKeiWbwfYOGpckwxwJtWvNnhEnwGciMX3Ea1oE3dWsX4jsnaxF00zVlbMGh5";

  constructor() {
    this.stripeHandler = StripeCheckout.configure({
      key: this.stripePublicKey,
      locale: 'en',
      token: (token) => {
        fetch('/confirmBook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            stripeTokenId: token.id,
            doctorId: this.doctorId
          })
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message);
        })
        .catch(error => {
          console.error(error);
        });
      }
    });
  }

  payWithStripe(_id, price) {
    this.doctorId = _id;
    this.stripeHandler.open({
      amount: price * 100
    });
  }
}

const stripeClient = new StripeClient();
