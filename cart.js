/* =========================================================
   PHANTOM — Cart state, Nav, Cart sheet, Toasts
   ========================================================= */

const PHANTOM_PRODUCT = {
  id: "phantom-purple-rush",
  name: "PHANTOM Pre-Workout",
  flavor: "Purple Rush",
  price: 49.99,
  compareAt: 64.99,
  image: "image.png",
};

function money(n) {
  return "$" + n.toFixed(2);
}

/* ---------------- Cart storage ---------------- */
const CART_KEY = "phantom_cart_items";

function getCart() {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveCart(items) {
  try {
    sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (e) {}
  renderCart();
}
function cartCount(items) { return items.reduce((n, i) => n + i.qty, 0); }
function cartSubtotal(items) { return items.reduce((n, i) => n + i.price * i.qty, 0); }

function addToCart(item, qty) {
  qty = qty || 1;
  const items = getCart();
  const idx = items.findIndex((p) => p.id === item.id);
  if (idx >= 0) {
    items[idx].qty += qty;
  } else {
    items.push(Object.assign({}, item, { qty }));
  }
  saveCart(items);
  openCart();
}
function removeFromCart(id) {
  saveCart(getCart().filter((p) => p.id !== id));
}
function setCartQty(id, qty) {
  qty = Math.max(1, qty);
  saveCart(getCart().map((p) => (p.id === id ? Object.assign({}, p, { qty }) : p)));
}
function clearCart() { saveCart([]); }

/* ---------------- Cart sheet render ---------------- */
function renderCart() {
  const items = getCart();
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  document.querySelectorAll(".cart-badge").forEach((el) => {
    el.textContent = count;
    el.classList.toggle("show", count > 0);
  });

  if (typeof renderOrderSummary === "function" && document.getElementById("orderBox")) {
    renderOrderSummary();
  }

  const body = document.getElementById("cartItemsBody");
  const footer = document.getElementById("cartSheetFooter");
  if (!body) return;

  if (items.length === 0) {
    body.innerHTML =
      '<div class="cart-empty"><div class="txt">Your cart is empty.</div>' +
      '<button class="btn btn-secondary" onclick="closeCart()">Continue browsing</button></div>';
    if (footer) footer.classList.remove("show");
    return;
  }

  body.innerHTML =
    '<div class="cart-items">' +
    items
      .map(
        (i) => `
      <div class="cart-item">
        <div class="thumb"><img src="${i.image}" alt="${i.name}"></div>
        <div class="info">
          <div>
            <div class="name">${i.name}</div>
            <div class="flavor">${i.flavor}</div>
          </div>
          <div class="row2">
            <div class="qty-control">
              <button onclick="setCartQty('${i.id}',${i.qty - 1})">−</button>
              <span>${i.qty}</span>
              <button onclick="setCartQty('${i.id}',${i.qty + 1})">+</button>
            </div>
            <div class="price">${money(i.price * i.qty)}</div>
          </div>
        </div>
        <button class="remove" aria-label="Remove" onclick="removeFromCart('${i.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </div>`
      )
      .join("") +
    "</div>";

  if (footer) {
    footer.classList.add("show");
    footer.innerHTML = `
      <div class="row"><span class="sub">Subtotal</span><span>${money(subtotal)}</span></div>
      <div class="note">Shipping and taxes calculated at checkout.</div>
      <a href="checkout.html" class="btn btn-primary" onclick="closeCart()">Checkout</a>
    `;
  }
}

/* ---------------- Cart sheet open/close ---------------- */
function openCart() {
  document.getElementById("cartOverlay").classList.add("show");
  document.getElementById("cartSheet").classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  document.getElementById("cartOverlay").classList.remove("show");
  document.getElementById("cartSheet").classList.remove("show");
  document.body.style.overflow = "";
}

/* ---------------- Toast ---------------- */
function showToast(title, desc) {
  const host = document.getElementById("toastHost");
  if (!host) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<div class="t">${title}</div>${desc ? `<div class="d">${desc}</div>` : ""}`;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ---------------- Nav ---------------- */
function initNav() {
  const nav = document.getElementById("siteNav");
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 20);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menuBtn = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("open"));
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => mobileMenu.classList.remove("open"))
    );
  }

  const cartBtn = document.getElementById("cartBtn");
  if (cartBtn) cartBtn.addEventListener("click", openCart);
  const overlay = document.getElementById("cartOverlay");
  if (overlay) overlay.addEventListener("click", closeCart);
  const cartClose = document.getElementById("cartSheetClose");
  if (cartClose) cartClose.addEventListener("click", closeCart);
}

/* ---------------- Reveal-on-scroll ---------------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "-80px" }
  );
  els.forEach((el) => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  renderCart();
  initReveal();
});
