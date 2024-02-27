
//let rzp1 = new Razorpay(options);
/*
document.getElementById('rzp-button1').onclick = async function(e) {
  e.preventDefault();
  let response = await fetch('/payment', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: amount,
    })
  })
  let orderData = await response.json();
  let options = {
    "key": "rzp_test_E28ZEhyFQWOMwq", // Enter the Key ID generated from the Dashboard
    "amount": "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "order_id": "order_9A33XWu170gUtm", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
  };
  rzp1.open();
}
*/
/*
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
*/
/*
async function payWithRajorPay(id, amount) {
  try {
    const response = await fetch('/payment', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100,
      })
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      alert(data.message);
    }).catch(function(error) {
      console.error(error);
    })

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const orderData = await response.json();

    const options = {
      "key": "rzp_test_E28ZEhyFQWOMwq",
      "amount": orderData.amount,
      "currency": "INR",
      "order_id": orderData.id,
      "name": "Carex",
      "callback_url": ""
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
  } catch (error) {
    console.error('Error:', error.message);
  }
}
*/
async function payWithRajorPay(id, amount) {
  try {
    const response = await fetch('/payment', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100,
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const responseData = await response.json();

    if (responseData.success) {
      const options = {
        "key_id": "rzp_test_E28ZEhyFQWOMwq",
        "amount": responseData.order.amount,
        "currency": "INR",
        "order_id": responseData.order.id,
        "name": "Carex",
        "callback_url": ""
      };
      const rzp1 = new Razorpay(options);
      rzp1.open();
    } else {
      alert(responseData.message);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}
