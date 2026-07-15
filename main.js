/* =========================================================
   PHANTOM — Page-specific interactive components
   ========================================================= */

/* ---------------- Hero parallax (home) ---------------- */
function initHeroParallax() {
  const hero = document.getElementById("hero");
  if (!hero) return;
  const media = hero.querySelector(".hero-media");
  const overlay = hero.querySelector(".hero-overlay");
  const content = hero.querySelector(".hero-content");

  function onScroll() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight;
    const progress = Math.min(1, Math.max(0, -rect.top / total));
    media.style.transform = `translateY(${progress * 40}%) scale(${1 + progress * 0.15})`;
    overlay.style.opacity = String(0.4 + progress * 0.55);
    content.style.transform = `translateY(${progress * -60}%)`;
    content.style.opacity = String(Math.max(0, 1 - progress / 0.6));
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------------- Quick buy bar (home) ---------------- */
function initQuickBuy() {
  const bar = document.getElementById("quickBuy");
  if (!bar) return;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? y / max : 0;
    bar.classList.toggle("show", pct > 0.25 && pct < 0.92);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.querySelectorAll("[data-add-phantom]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(
        { id: PHANTOM_PRODUCT.id, name: PHANTOM_PRODUCT.name, flavor: PHANTOM_PRODUCT.flavor, price: PHANTOM_PRODUCT.price, image: PHANTOM_PRODUCT.image },
        1
      );
      showToast("Added to cart", "Phantom Pre-Workout · Purple Rush");
    });
  });
}

/* ---------------- Product page ---------------- */
function initProductPage() {
  const gallery = document.getElementById("galleryMain");
  if (!gallery) return;

  const images = [PHANTOM_PRODUCT.image, PHANTOM_PRODUCT.image, PHANTOM_PRODUCT.image, PHANTOM_PRODUCT.image];
  const mainImg = document.getElementById("galleryMainImg");
  const thumbs = document.querySelectorAll(".gallery-thumbs button");
  thumbs.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      mainImg.style.opacity = 0;
      setTimeout(() => {
        mainImg.src = images[i];
        mainImg.style.opacity = 1;
      }, 150);
      thumbs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  let qty = 1;
  const qtyDisplay = document.getElementById("productQty");
  document.getElementById("qtyMinus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyDisplay.textContent = qty;
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    qty += 1;
    qtyDisplay.textContent = qty;
  });

  document.getElementById("addToCartBtn").addEventListener("click", () => {
    addToCart(
      { id: PHANTOM_PRODUCT.id, name: PHANTOM_PRODUCT.name, flavor: PHANTOM_PRODUCT.flavor, price: PHANTOM_PRODUCT.price, image: PHANTOM_PRODUCT.image },
      qty
    );
    showToast("Added to cart");
  });

  // Accordion
  document.querySelectorAll(".acc-item").forEach((item) => {
    item.querySelector(".acc-q").addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".acc-item").forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

/* ---------------- Checkout page ---------------- */
function initCheckout() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  renderOrderSummary();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (getCart().length === 0) return;
    const submitBtn = document.getElementById("checkoutSubmit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";
    setTimeout(() => {
      clearCart();
      window.location.href = "account.html?ordered=1";
    }, 900);
  });
}

function renderOrderSummary() {
  const box = document.getElementById("orderBox");
  if (!box) return;
  const items = getCart();
  const subtotal = cartSubtotal(items);
  const shipping = subtotal > 60 || subtotal === 0 ? 0 : 6.99;
  const tax = subtotal * 0.085;
  const total = subtotal + shipping + tax;
  const submitBtn = document.getElementById("checkoutSubmit");

  let html = '<div class="h">Order</div>';

  if (items.length === 0) {
    html += `<p class="order-empty">Your cart is empty. <a href="product.html">Shop Phantom</a>.</p>`;
    if (submitBtn) submitBtn.disabled = true;
  } else {
    html +=
      '<div class="order-items">' +
      items
        .map(
          (i) => `
        <div class="order-item">
          <div class="thumb"><img src="${i.image}" alt=""><span class="qtybadge">${i.qty}</span></div>
          <div class="info">
            <div class="name">${i.name}</div>
            <div class="flavor">${i.flavor}</div>
          </div>
          <div class="price">${money(i.price * i.qty)}</div>
        </div>`
        )
        .join("") +
      "</div>";
    if (submitBtn) submitBtn.disabled = false;
  }

  html += `
    <div class="order-totals">
      <div class="row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
      <div class="row"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
      <div class="row"><span>Tax</span><span>${money(tax)}</span></div>
      <div class="total"><span class="lbl2">Total</span><span class="val">${money(total)}</span></div>
    </div>
  `;

  box.innerHTML = html;

  // re-append the submit button + secure note (they live outside orderBox in HTML, so nothing else to do)
}

/* ---------------- Account page: order confirmation toast ---------------- */
function initAccountConfirm() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("ordered") === "1") {
    showToast("Order placed", "Your ritual begins soon.");
    // clean the URL
    window.history.replaceState({}, "", "account.html");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroParallax();
  initQuickBuy();
  initProductPage();
  initCheckout();
  initAccountConfirm();
});
