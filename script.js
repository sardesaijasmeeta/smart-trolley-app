async function updateCart() {
    try {
        const response = await fetch('/api'); // Fetches scanned items from your MongoDB via the API
        const data = await response.json();
        
        const cartTable = document.getElementById('cart-items');
        cartTable.innerHTML = ''; // Clear old rows
        
        let subtotal = 0;
        data.items.forEach(item => {
            const row = `<tr><td>${item.name}</td><td>₹${item.price}</td></tr>`;
            cartTable.innerHTML += row;
            subtotal += item.price;
        });

        const gst = subtotal * 0.18;
        document.getElementById('gst-amount').innerText = `₹${gst.toFixed(2)}`;
        document.getElementById('total-price').innerText = `₹${(subtotal + gst).toFixed(2)}`;
    } catch (err) {
        console.error("Error updating cart:", err);
    }
}

// Check for new items every 3 seconds
setInterval(updateCart, 3000);