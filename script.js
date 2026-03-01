async function refreshCart() {
    try {
        const res = await fetch('/api/cart');
        const data = await res.json();
        const tableBody = document.getElementById('cart-items');
        
        tableBody.innerHTML = '';
        let subtotal = 0;

        if (data.items.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2" class="empty-msg">Waiting for scans...</td></tr>';
        } else {
            data.items.forEach(item => {
                subtotal += item.price;
                tableBody.innerHTML += `
                    <tr>
                        <td>${item.name}</td>
                        <td>₹${item.price.toFixed(2)}</td>
                    </tr>`;
            });
        }

        const gst = subtotal * 0.18;
        const total = subtotal + gst;

        document.getElementById('gst-amount').innerText = `₹${gst.toFixed(2)}`;
        document.getElementById('total-price').innerText = `₹${total.toFixed(2)}`;
    } catch (e) {
        console.error("Polling error", e);
    }
}

async function handleCheckout() {
    if (!confirm("Confirm payment and clear trolley?")) return;

    try {
        const response = await fetch('/api/checkout', { method: 'POST' });
        
        if (response.ok) {
            // Trigger the UI modal we built in the HTML
            showUPI(); 
        } else {
            const data = await response.json();
            alert("Checkout failed: " + (data.error || "Unknown error"));
        }
    } catch (err) {
        console.error("Checkout Error:", err);
    }
}

// Update UI every 2 seconds
setInterval(refreshCart, 2000);