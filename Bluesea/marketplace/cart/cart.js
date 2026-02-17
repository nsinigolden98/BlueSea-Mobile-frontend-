(function () {
  'use strict';

  const itemsList = document.getElementById('itemsList');
  const emptyState = document.getElementById('emptyState');
  const subtotalEl = document.getElementById('subtotal');
  const serviceFeeEl = document.getElementById('serviceFee');
  const taxEl = document.getElementById('tax');
  const finalTotalEl = document.getElementById('finalTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const mobileCheckout = document.getElementById('mobileCheckout');
  const mobileTotal = document.getElementById('mobileTotal');
  const mobileCheckoutBtn = document.getElementById('mobileCheckoutBtn');
  const desktopCountBadge = document.getElementById('desktopCountBadge');
  const continueShopping = document.getElementById('continueShopping');

  const STORAGE_KEY = 'bsm_cart';
  const DANGER_COLOR = getComputedStyle(document.documentElement)
    .getPropertyValue('--danger') || '#e63946';

  /* --------------------------------------------------
     DEMO ITEMS (REMOVE AFTER TESTING)
     -------------------------------------------------- */
  /*
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
      { id: 1, title: "VIP Concert Ticket", price: 15000, quantity: 2, seller: "Blue Sea", category: "Music" },
      { id: 2, title: "Football Match Ticket", price: 8000, quantity: 1, seller: "Verified Seller", category: "Sports" },
      { id: 3, title: "Comedy Show Pass", price: 5000, quantity: 3, seller: "Laugh Hub", category: "Comedy" },
      { id: 4, title: "Tech Conference", price: 20000, quantity: 1, seller: "Dev Africa", category: "Tech" },
      { id: 5, title: "Movie Premiere", price: 6000, quantity: 2, seller: "Cinema World", category: "Movies" }
    ]));
  }
  */

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function formatCurrency(value) {
    return '₦' + (Number(value) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function parseCurrency(text) {
    return Number(text.replace(/[^\d.-]/g, '')) || 0;
  }

  function computeFees(subtotal) {
    return {
      service: subtotal * 0.05,
      tax: subtotal * 0.08
    };
  }

  function setCheckoutEnabled(enabled) {
    checkoutBtn.disabled = !enabled;
    mobileCheckoutBtn.disabled = !enabled;
  }

  function recalcTotals(cart) {
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const { service, tax } = computeFees(subtotal);
    const total = subtotal + service + tax;

    subtotalEl.textContent = formatCurrency(subtotal);
    serviceFeeEl.textContent = formatCurrency(service);
    taxEl.textContent = formatCurrency(tax);
    finalTotalEl.textContent = formatCurrency(total);
    mobileTotal.textContent = formatCurrency(total);

    const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
    desktopCountBadge.textContent = totalQty;

    setCheckoutEnabled(cart.length > 0);
  }

  function createItemCard(item, cart) {
    const card = document.createElement('article');
    card.className = 'item-card';

    const body = document.createElement('div');
    body.className = 'item-body';

    const title = document.createElement('h3');
    title.className = 'item-title';
    title.textContent = item.title;

    const seller = document.createElement('div');
    seller.className = 'seller';
    seller.textContent = item.seller ? `Sold by ${item.seller}` : '';

    const price = document.createElement('div');
    price.className = 'unit-price';
    price.textContent = formatCurrency(item.price);

    const qtyValue = document.createElement('div');
    qtyValue.className = 'qty-value';
    qtyValue.textContent = item.quantity;

    const minus = document.createElement('button');
    minus.className = 'qty-btn';
    minus.textContent = '−';

    const plus = document.createElement('button');
    plus.className = 'qty-btn';
    plus.textContent = '+';

    const remove = document.createElement('button');
    remove.className = 'remove-btn';
    remove.innerHTML = `<svg width="16" height="16"><path fill="${DANGER_COLOR}" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6z"/></svg>`;

    minus.onclick = () => {
      if (item.quantity <= 1) {
        remove.click();
        return;
      }
      item.quantity--;
      writeCart(cart);
      render();
    };

    plus.onclick = () => {
      item.quantity++;
      writeCart(cart);
      render();
    };

    remove.onclick = () => {
      const idx = cart.findIndex(i => i.id === item.id);
      if (idx > -1) cart.splice(idx, 1);
      writeCart(cart);
      render();
    };

    body.append(title, seller, price, minus, qtyValue, plus, remove);
    card.appendChild(body);

    return card;
  }

  function render() {
    const cart = readCart();
    itemsList.innerHTML = '';

    if (!cart.length) {
      emptyState.style.display = 'flex';
      mobileCheckout.style.display = 'none';
      document.getElementById('summaryPanel').style.display = 'none';
      recalcTotals([]);
      return;
    }

    emptyState.style.display = 'none';
    mobileCheckout.style.display = 'block';
    document.getElementById('summaryPanel').style.display = 'block';

    cart.forEach(item => itemsList.appendChild(createItemCard(item, cart)));
    recalcTotals(cart);
  }

  continueShopping.addEventListener('click', e => e.preventDefault());

  render();
})();