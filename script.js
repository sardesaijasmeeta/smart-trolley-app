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
    // 1. Ask for confirmation
    if (!confirm("Confirm payment and clear trolley?")) return;

    try {
        const response = await fetch('/api/checkout', { method: 'POST' });
        const data = await response.json();

        if (response.ok) {
            // 2. Show the UPI QR Code (Instructional)
            showUPI(); 
            alert("Payment Successful! Your cart has been cleared.");
            location.reload(); // Refresh the page
        } else {
            alert("Checkout failed: " + data.error);
        }
    } catch (err) {
        console.error("Checkout Error:", err);
    }
}

// Update UI every 2 seconds
setInterval(refreshCart, 2000);