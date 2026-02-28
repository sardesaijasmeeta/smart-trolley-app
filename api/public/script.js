const GST_RATE = 0.18;

// Navigation
function showCatalog() {
  document.getElementById("cart-section").classList.add("hidden");
  document.getElementById("catalog-section").classList.remove("hidden");
}

function showCart() {
  document.getElementById("catalog-section").classList.add("hidden");
  document.getElementById("cart-section").classList.remove("hidden");
}

// Fetch Cart
async function fetchCart() {
  try {
    const response = await fetch("/cart");
    const cart = await response.json();

    const tbody = document.getElementById("cart-items");
    tbody.innerHTML = "";

    let subtotal = 0;

    // GROUP ITEMS BY NAME
    const grouped = {};

    cart.forEach(item => {
      if (!grouped[item.name]) {
        grouped[item.name] = {
          price: item.price,
          quantity: 0
        };
      }
      grouped[item.name].quantity += 1;
    });

    // RENDER GROUPED ITEMS
    for (const name in grouped) {
      const item = grouped[name];
      const totalPrice = item.price * item.quantity;
      subtotal += totalPrice;

      const row = `
        <tr>
          <td>${name} (${item.quantity})</td>
          <td>₹${totalPrice}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    }

    const gst = subtotal * GST_RATE;
    const finalTotal = subtotal + gst;

    document.querySelector(".summary").innerHTML = `
      <p>GST (18%): ₹${gst.toFixed(2)}</p>
      <p class="total">Total: ₹${finalTotal.toFixed(2)}</p>
    `;

  } catch (error) {
    console.error("Error fetching cart:", error);
  }
}

// Fetch Products and Render Catalog
async function loadCatalog() {
  try {
    const response = await fetch("/products");
    const products = await response.json();

    const container = document.getElementById("catalog-container");
    container.innerHTML = "";

    const grouped = {};

    products.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });

    for (const category in grouped) {
      const categoryBlock = document.createElement("div");
      categoryBlock.innerHTML = `<h3 style="margin-top:20px;">${category}</h3>`;

      const grid = document.createElement("div");
      grid.className = "catalog-grid";

      grouped[category].forEach(product => {
        const stockStatus =
          product.stock > 0
            ? `<p style="color:green;">In Stock (${product.stock})</p>`
            : `<p style="color:red;">Out of Stock</p>`;

        const card = document.createElement("div");
        card.className = "catalog-card";
        card.innerHTML = `
          <strong>${product.name}</strong>
          <p>₹${product.price}</p>
          <p>${product.aisle}</p>
          ${stockStatus}
        `;

        grid.appendChild(card);
      });

      categoryBlock.appendChild(grid);
      container.appendChild(categoryBlock);
    }
  } catch (error) {
    console.error("Error loading catalog:", error);
  }
}

setInterval(fetchCart, 2000);
fetchCart();
loadCatalog();