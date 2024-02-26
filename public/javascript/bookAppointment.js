
let doctorId;
let stripeHandler = StripeCheckout.configure({
  key: "pk_test_51OnkzpSGKgFmrVkvBljgILktH5432upsm1aW1fiKeiWbwfYOGpckwxwJtWvNnhEnwGciMX3Ea1oE3dWsX4jsnaxF00zVlbMGh5"
  ,
  locale: 'en',
  token: function(token) {
    fetch('/confirmBook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        stripeTokenId: token.id,
        doctorId: doctorId
      })
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      alert(data.message);

    }).catch(function(error) {
      console.error(error);
    })
  }
})
function bookAppointment(_id, price) {
  doctorId = _id;
  stripeHandler.open({
    amount: price * 100
  })
}
