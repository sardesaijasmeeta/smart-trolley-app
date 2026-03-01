async function refreshCart() {
    try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        const tableBody = document.getElementById('cart-items');
        
        tableBody.innerHTML = '';
        let subtotal = 0;

        data.items.forEach(item => {
            subtotal += item.price;
            tableBody.innerHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                </tr>`;
        });

        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        document.getElementById('gst-amount').innerText = `₹${gst.toFixed(2)}`;
        document.getElementById('total-price').innerText = `₹${total.toFixed(2)}`;
    } catch (e) {
        console.error("Polling error", e);
    }
}
async function handleCheckout() {
    if (confirm("Proceed to pay and clear cart?")) {
        const response = await fetch('https://smart-trolley-app-delta.vercel.app/api/checkout', {
            method: 'POST'
        });
        const data = await response.json();
        alert(data.message);
        location.reload(); // Refresh to show empty cart
    }
}

// Update UI every 2 seconds
setInterval(refreshCart, 2000);