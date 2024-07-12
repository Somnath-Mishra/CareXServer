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
        "order_id": responseData.order.order.id,
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
