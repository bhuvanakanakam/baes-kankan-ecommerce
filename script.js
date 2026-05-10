// ═══════════════════════════════════════════════════
//  Bae's Kankan — Main Script
//  Cart · Wishlist · Auth · Search · Filter · Sort
// ═══════════════════════════════════════════════════

// Use backend only when running locally; on Vercel/CDN use fallback products
const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001/api'
  : null;

// ── State ─────────────────────────────────────────
let cart      = JSON.parse(localStorage.getItem('cart')      || '[]');
let wishlist  = JSON.parse(localStorage.getItem('wishlist')  || '[]');
let allProducts = [];

// ── Persist ───────────────────────────────────────
const saveCart     = () => localStorage.setItem('cart',     JSON.stringify(cart));
const saveWishlist = () => localStorage.setItem('wishlist', JSON.stringify(wishlist));

// ── Format currency ───────────────────────────────
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');

// ── Toast ─────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.opacity = '0', 2800);
}

// ── Badges ────────────────────────────────────────
function updateBadges() {
  const cartQty = cart.reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = cartQty);
  document.querySelectorAll('#cart-item-count').forEach(el => el.textContent = cartQty);
  document.querySelectorAll('#wishlist-count').forEach(el => el.textContent = wishlist.length);
}

// ── Auth: user button ─────────────────────────────
function handleUserClick() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
    if (confirm(`Signed in as ${user.fullName || user.email}.\n\nSign out?`)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showToast('Signed out');
      updateUserBtn();
    }
  } else {
    window.location.href = 'login.html';
  }
}

function updateUserBtn() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const btn  = document.getElementById('user-btn');
  if (!btn) return;
  if (user) {
    btn.title = `Hi, ${user.fullName || user.email}`;
    btn.style.color = '#8f5e2e';
  } else {
    btn.title = 'Sign In';
    btn.style.color = '';
  }
}

// ══════════════════════════════════════════════════
//  CART
// ══════════════════════════════════════════════════
function openCart()  { document.getElementById('cart-sidebar')?.classList.add('open'); document.getElementById('cart-overlay')?.classList.add('open'); renderCart(); }
function closeCart() { document.getElementById('cart-sidebar')?.classList.remove('open'); document.getElementById('cart-overlay')?.classList.remove('open'); }

function addToCart(id, name, price, image) {
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.quantity++; }
  else { cart.push({ id, name, price, image, quantity: 1 }); }
  saveCart();
  updateBadges();
  renderCart();
  showToast(`${name} added to cart!`);
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveCart(); updateBadges(); renderCart();
}

function changeQty(idx, delta) {
  cart[idx].quantity = Math.max(1, cart[idx].quantity + delta);
  saveCart(); updateBadges(); renderCart();
}

function renderCart() {
  const list    = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total-amount');
  if (!list) return;

  if (!cart.length) {
    list.innerHTML = '<p style="color:#888;text-align:center;margin-top:50px;font-size:14px">Your cart is empty</p>';
    if (totalEl) totalEl.textContent = '₹0';
    return;
  }

  let total = 0;
  list.innerHTML = '';
  cart.forEach((item, idx) => {
    total += item.price * item.quantity;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${item.image||'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'}" onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${fmt(item.price)}</p>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${idx})">&#x2715;</button>
    `;
    list.appendChild(el);
  });
  if (totalEl) totalEl.textContent = fmt(total);
}

// ══════════════════════════════════════════════════
//  WISHLIST
// ══════════════════════════════════════════════════
function toggleWishlist(id, name, price, image, btn) {
  const idx = wishlist.findIndex(i => i.id === id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast('Removed from wishlist');
    if (btn) btn.classList.remove('active');
  } else {
    wishlist.push({ id, name, price, image });
    showToast(`${name} saved to wishlist!`);
    if (btn) btn.classList.add('active');
  }
  saveWishlist(); updateBadges();
}

function showWishlist() {
  const container = document.getElementById('product-container');
  if (!container) return;
  if (!wishlist.length) { showToast('Your wishlist is empty'); return; }
  container.innerHTML = '';
  wishlist.forEach(p => container.appendChild(buildCard({
    ProductID: p.id, ProductName: p.name, Price: p.price, ImagePath: p.image, Rating: 5
  })));
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════
function buildCard(p) {
  const id    = p.ProductID;
  const name  = p.ProductName;
  const price = p.Price;
  const img   = p.ImagePath || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80';
  const stars = '★'.repeat(Math.round(p.Rating || 5)) + '☆'.repeat(5 - Math.round(p.Rating || 5));
  const inWish = wishlist.some(i => i.id === id);

  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <a href="product-details.html?id=${id}">
      <div class="card-img-wrap">
        <img src="${img}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'">
      </div>
    </a>
    <div class="card-body">
      <p class="card-category">${p.CategoryName || ''}</p>
      <a href="product-details.html?id=${id}" style="text-decoration:none">
        <h3>${name}</h3>
      </a>
      <p class="card-price">${fmt(price)}</p>
      <p class="card-stars">${stars}</p>
    </div>
    <div class="card-actions">
      <button class="btn-cart"
        onclick="addToCart(${id},'${name.replace(/'/g,"\\'")}',${price},'${img}')">
        Add to Cart
      </button>
      <button class="btn-wish ${inWish ? 'active' : ''}"
        id="wish-${id}"
        onclick="toggleWishlist(${id},'${name.replace(/'/g,"\\'")}',${price},'${img}',this)">
        <i class="fas fa-heart"></i>
      </button>
    </div>
  `;
  return card;
}

async function loadProducts(params = {}) {
  const container = document.getElementById('product-container');
  if (!container) return;

  container.innerHTML = `<p style="padding:30px;color:#888;grid-column:1/-1;text-align:center">Loading...</p>`;

  // Always load the full product list first (needed for client-side filtering)
  if (!allProducts.length) {
    if (API) {
      try {
        const res  = await fetch(`${API}/products`);
        const data = await res.json();
        if (data.success) allProducts = data.products;
        else throw new Error();
      } catch {
        allProducts = FALLBACK_PRODUCTS;
      }
    } else {
      allProducts = FALLBACK_PRODUCTS;
    }
  }

  // Apply all filters client-side (works with or without backend)
  let displayed = [...allProducts];

  if (params.category) {
    displayed = displayed.filter(p => p.CategoryName === params.category);
  }
  if (params.minPrice) {
    displayed = displayed.filter(p => Number(p.Price) >= Number(params.minPrice));
  }
  if (params.maxPrice) {
    displayed = displayed.filter(p => Number(p.Price) <= Number(params.maxPrice));
  }

  const searchVal = document.getElementById('search-input')?.value?.trim().toLowerCase();
  if (searchVal) {
    displayed = displayed.filter(p =>
      p.ProductName.toLowerCase().includes(searchVal) ||
      (p.CategoryName || '').toLowerCase().includes(searchVal)
    );
  }

  if (params.sort === 'price_asc')  displayed.sort((a,b) => a.Price - b.Price);
  if (params.sort === 'price_desc') displayed.sort((a,b) => b.Price - a.Price);
  if (params.sort === 'rating')     displayed.sort((a,b) => b.Rating - a.Rating);

  container.innerHTML = '';
  if (!displayed.length) {
    container.innerHTML = `<p style="padding:30px;color:#888;grid-column:1/-1;text-align:center">No products found matching your filters.</p>`;
  } else {
    displayed.forEach(p => container.appendChild(buildCard(p)));
  }

  const countEl = document.getElementById('results-count');
  if (countEl) countEl.textContent = `${displayed.length} product${displayed.length !== 1 ? 's' : ''}`;
}

// ── Filter & Sort ─────────────────────────────────
let activeCategory = '';

function applyFilters() {
  const sort     = document.getElementById('sort-select')?.value || '';
  const minPrice = document.getElementById('min-price')?.value || '';
  const maxPrice = document.getElementById('max-price')?.value || '';
  loadProducts({ sort, minPrice, maxPrice, category: activeCategory });
}

function applyCategory(cat) {
  activeCategory = cat;
  applyFilters();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

function clearFilters() {
  activeCategory = '';
  const sortEl = document.getElementById('sort-select');
  const minEl  = document.getElementById('min-price');
  const maxEl  = document.getElementById('max-price');
  if (sortEl) sortEl.value = '';
  if (minEl)  minEl.value  = '';
  if (maxEl)  maxEl.value  = '';
  // Don't wipe allProducts — just re-render with no filters
  loadProducts();
}

// ── Search ────────────────────────────────────────
function handleSearch() {
  const query = document.getElementById('search-input')?.value?.trim();
  if (!query) { exitSearchView(); return; }
  enterSearchView(query);
}

function enterSearchView(query) {
  // Hide hero, categories, filter bar, newsletter
  ['quote','categories','filter-bar','newsletter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Show or create search header above #products
  let header = document.getElementById('search-results-header');
  if (!header) {
    header = document.createElement('div');
    header.id = 'search-results-header';
    header.className = 'search-results-header';
    const productsSection = document.getElementById('products');
    if (productsSection) productsSection.parentNode.insertBefore(header, productsSection);
  }
  header.style.display = 'block';
  header.innerHTML = `
    <h2>Results for <span>"${query}"</span></h2>
    <p id="search-result-count" style="color:#888;font-size:14px"></p>
    <button class="search-clear-btn" onclick="exitSearchView()">
      <i class="fas fa-times"></i> Clear search &amp; go back
    </button>
  `;

  applyFilters();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitSearchView() {
  ['quote','categories','filter-bar','newsletter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });
  const header = document.getElementById('search-results-header');
  if (header) header.style.display = 'none';

  const si = document.getElementById('search-input');
  if (si) si.value = '';

  activeCategory = '';
  allProducts = [];
  loadProducts();
}

// ══════════════════════════════════════════════════
//  PRODUCT DETAIL PAGE
// ══════════════════════════════════════════════════
async function loadProductDetail() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) return;

  let p;
  if (API) {
    try {
      const res  = await fetch(`${API}/products/${id}`);
      const data = await res.json();
      if (data.success) p = data.product;
      else throw new Error();
    } catch {
      p = FALLBACK_PRODUCTS.find(x => x.ProductID === Number(id));
    }
  } else {
    p = FALLBACK_PRODUCTS.find(x => x.ProductID === Number(id));
  }
  if (!p) return;

  document.title = `${p.ProductName} — Bae's Kankan`;
  document.getElementById('detail-name')?.setAttribute('data-product', JSON.stringify(p));

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('detail-name',        p.ProductName);
  set('detail-price',       fmt(p.Price));
  set('detail-category',    p.CategoryName || '');
  set('detail-stars',       '★'.repeat(Math.round(p.Rating || 5)));
  set('detail-description', p.Description || 'Premium quality, crafted for style and comfort. Part of our exclusive collection — limited stock available. Free shipping on orders above ₹5,000.');

  const priceEl = document.getElementById('detail-price');
  if (priceEl) priceEl.dataset.raw = p.Price;

  const imgEl = document.getElementById('detail-image');
  if (imgEl) imgEl.src = p.ImagePath;

  // Add to cart btn
  const cartBtn = document.getElementById('add-to-cart-btn');
  if (cartBtn) cartBtn.onclick = () => addToCart(p.ProductID, p.ProductName, p.Price, p.ImagePath);

  // Wishlist btn
  const wishBtn = document.getElementById('wishlist-btn-detail');
  if (wishBtn) {
    const inWish = wishlist.some(i => i.id === p.ProductID);
    if (inWish) wishBtn.style.color = '#e44';
    wishBtn.onclick = () => toggleWishlist(p.ProductID, p.ProductName, p.Price, p.ImagePath, wishBtn);
  }

  // Load related products
  allProducts = FALLBACK_PRODUCTS;
  try {
    const res  = await fetch(`${API}/products`);
    const data = await res.json();
    if (data.success) allProducts = data.products;
  } catch {}

  const container = document.getElementById('product-container');
  if (container) {
    const related = allProducts.filter(x => x.ProductID !== p.ProductID).slice(0, 4);
    container.innerHTML = '';
    related.forEach(x => container.appendChild(buildCard(x)));
  }
}

// ── Newsletter ────────────────────────────────────
function subscribeNewsletter(e) {
  e.preventDefault();
  const email = document.getElementById('nl-email')?.value;
  if (email) { showToast('🎉 You\'re subscribed! Check your inbox.'); e.target.reset(); }
}

// ══════════════════════════════════════════════════
//  FALLBACK PRODUCTS (when backend is offline)
// ══════════════════════════════════════════════════
// ── CDN image URLs (real brand product photos) ────────
const FALLBACK_PRODUCTS = [
  // ── Shoes ─────────────────────────────────────────
  {
    ProductID:1,  CategoryName:'Shoes', ProductName:'UGG Classic Boots', Price:7000, Rating:5,
    ImagePath:'https://dms.deckers.com/ugg/image/upload/t_product-xlarge-wp/v1770062263/1016223-CHE_1.png',
    Description:'The iconic UGG Classic Boot in chestnut. Twin-faced sheepskin upper keeps feet warm and dry, with a Treadlite by UGG outsole for lightweight cushioning all day long. A wardrobe staple since 1978.'
  },
  {
    ProductID:2,  CategoryName:'Shoes', ProductName:'New Balance 574 Sneakers', Price:11700, Rating:5,
    ImagePath:'https://nb.scene7.com/is/image/NB/ml574evg_nb_02_i?$pdpflexf2$&wid=600&hei=600',
    Description:'The heritage New Balance 574 in sage green. Features ENCAP midsole cushioning, a pigskin suede and mesh upper, and the classic NB heel patch. Timeless streetwear silhouette built for all-day wear.'
  },
  {
    ProductID:11, CategoryName:'Shoes', ProductName:'Channel Ballet Flats', Price:32000, Rating:4.8,
    ImagePath:'https://www.chanel.com/images///f_auto,q_auto:good,dpr_1.1/w_1024/-9543237795870.jpg',
    Description:'Chanel slingback ballet flats in ivory grosgrain. Signature CC logo cap-toe detail, leather-lined interior, and a delicate block heel. Parisian refinement distilled into a single, effortless shoe.'
  },
  {
    ProductID:12, CategoryName:'Shoes', ProductName:'Aldo Strappy Heels', Price:4500, Rating:4.7,
    ImagePath:'https://m.media-amazon.com/images/I/71d0bRgTy2L._AC_SR768,1024_.jpg',
    Description:'Aldo strappy block-heeled sandals with an adjustable ankle strap. Cushioned insole, 3.5-inch stable block heel, and a sleek minimal silhouette. The after-five shoe that goes with everything.'
  },
  {
    ProductID:13, CategoryName:'Shoes', ProductName:'Coach Leather Loafers', Price:18500, Rating:4.9,
    ImagePath:'https://coach.scene7.com/is/image/Coach/cm752_bka_a0?$desktopProduct$',
    Description:'Coach Wylie loafer in burnished refined calf leather. Signature horse-and-carriage hardware accent, full leather lining, and a leather outsole. A timeless slip-on that works from desk to dinner.'
  },
  {
    ProductID:14, CategoryName:'Shoes', ProductName:'Polo Ralph Lauren Boat Shoes', Price:8900, Rating:4.8,
    ImagePath:'https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-AI803932996002_lifestyle?$rl_4x5_zoom$',
    Description:'Classic Polo Ralph Lauren boat shoes in tan leather. Hand-sewn moccasin construction, 360° rawhide lacing, and a non-marking rubber outsole. Preppy heritage with the unmistakable Ralph Lauren touch.'
  },

  // ── Bags ──────────────────────────────────────────
  {
    ProductID:4,  CategoryName:'Bags', ProductName:'Coach Signature Handbag', Price:22000, Rating:5,
    ImagePath:'https://coach.scene7.com/is/image/Coach/ci032_b4ydt_a0?$desktopProduct$',
    Description:'Coach Charter crossbody in signature canvas with refined leather trim. Features an interior zip pocket and multifunction slip pockets. Adjustable strap converts seamlessly from crossbody to shoulder carry.'
  },
  {
    ProductID:5,  CategoryName:'Bags', ProductName:'Aldo Tote Bag', Price:10000, Rating:5,
    ImagePath:'https://n.nordstrommedia.com/it/dfd7bccc-1c4b-4ac7-b5fc-85bafb590425.jpeg',
    Description:'Aldo structured tote in premium vegan leather. Spacious zip-top interior with organiser pockets, twin shoulder straps, and magnetic snap closure. From the laptop to the weekend, it carries it all.'
  },
  {
    ProductID:15, CategoryName:'Bags', ProductName:'Burberry Crossbody Bag', Price:38000, Rating:4.9,
    ImagePath:'https://assets.burberry.com/is/image/Burberryltd/BF45A6F5-F4B5-4036-A2A0-26F505F93147',
    Description:'Burberry TB Mini Bag in smooth calfskin leather. Engraved Thomas Burberry monogram hardware, detachable gold-tone chain strap, and suede interior lining. Compact yet commanding — day to evening.'
  },
  {
    ProductID:16, CategoryName:'Bags', ProductName:'Celine Mini Luggage Bag', Price:95000, Rating:5,
    ImagePath:'https://www.celine.com/on/demandware.static/-/Library-Sites-Celine-SharedLibrary/default/dwcc02f88d/categories/menu/A00020_LUGGAGE_L100E3GW2.28BK_NV.jpg',
    Description:'Céline Mini Luggage in black smooth calfskin. The iconic structured silhouette with wrap-around handles and the Céline Paris embossed stamp. A coveted collector\'s piece from the house of Céline.'
  },
  {
    ProductID:17, CategoryName:'Bags', ProductName:'New Balance Gym Duffle', Price:5500, Rating:4.6,
    ImagePath:'https://nb.scene7.com/is/image/NB/ac4497ktre_nb_03_i?$pdpflexf2$&wid=600&hei=600',
    Description:'New Balance Athletics gym duffel bag in bold colourway. Spacious main compartment, ventilated shoe pocket, padded adjustable shoulder strap, and side water bottle pocket. Train in style.'
  },

  // ── Apparel ───────────────────────────────────────
  {
    ProductID:3,  CategoryName:'Apparel', ProductName:'Polo Ralph Lauren Sweater', Price:3000, Rating:5,
    ImagePath:'https://dtcralphlauren.scene7.com/is/image/PoloGSI/s7-1396676_alternate10?$rl_4x5_zoom$',
    Description:'Polo Ralph Lauren merino wool crewneck sweater. Ribbed cuffs and hem, iconic embroidered pony at the chest, and a slim-fit silhouette. Soft, warm, and effortlessly put-together for any season.'
  },
  {
    ProductID:18, CategoryName:'Apparel', ProductName:'Burberry Nova Check Scarf', Price:24000, Rating:4.9,
    ImagePath:'https://assets.burberry.com/is/image/Burberryltd/BD1DDEF4-EAAF-423B-9535-D6CE561FF680',
    Description:'Burberry\'s iconic Nova Check scarf woven in pure cashmere. The heritage camel, black, and red tartan pattern is a British institution. Generously sized, ultra-soft, and endlessly versatile.'
  },
  {
    ProductID:19, CategoryName:'Apparel', ProductName:'Polo Ralph Lauren Oxford Shirt', Price:6500, Rating:4.8,
    ImagePath:'https://m.media-amazon.com/images/I/71MLnSYrzjL._AC_SR736,920_.jpg',
    Description:'The Polo Ralph Lauren classic-fit Oxford shirt in soft-washed cotton poplin. Button-down collar, chest pocket, and signature embroidered pony. The essential smart-casual shirt for every wardrobe.'
  },
  {
    ProductID:20, CategoryName:'Apparel', ProductName:'Channel Tweed Blazer', Price:85000, Rating:5,
    ImagePath:'https://www.chanel.com/images/as///f_auto,q_auto:good,dpr_1.1/w_3200/-80383269.jpg',
    Description:'Chanel fantasy tweed jacket with a multicolour woven weave. Four-pocket front with jewel CC button closures and a silk lining. Quintessential Chanel — crafted in the iconic Rue Cambon ateliers, Paris.'
  },
  {
    ProductID:21, CategoryName:'Apparel', ProductName:'Coach Leather Jacket', Price:42000, Rating:4.7,
    ImagePath:'https://coach.scene7.com/is/image/Coach/ct723_blk_a0?$desktopProduct$',
    Description:'Coach moto jacket in smooth refined leather. Asymmetric front zip, signature Coach hardware, and a quilted lining for warmth. Rock-meets-luxury — made from Coach\'s heritage full-grain leather.'
  },

  // ── Accessories ───────────────────────────────────
  {
    ProductID:6,  CategoryName:'Accessories', ProductName:'Celine Triomphe Sunglasses', Price:40000, Rating:5,
    ImagePath:'https://image.celine.com/59c24ab04023b67b/original/4S194CPLB-38NO_1_SUM21_W.jpg',
    Description:'Céline Triomphe square sunglasses in ivory acetate. Subtle Triomphe logo at the temples, gradient UV-400 lenses, and an ultra-lightweight frame. Paris-designed, summer-ready, forever chic.'
  },
  {
    ProductID:7,  CategoryName:'Accessories', ProductName:'Fetch Gold Hoop Earrings', Price:1700, Rating:5,
    ImagePath:'https://fetch-mkt.com/cdn/shop/files/bba46a7ae4864968b7a606be8fab4265_600x.progressive_905a0d62-e891-4249-a635-e136727347e1.jpg',
    Description:'Fetch 14k gold-plated hollow hoop earrings. Lightweight construction with an easy push-through clasp and a seamless polished finish. The everyday essential that elevates any outfit, day or night.'
  },
  {
    ProductID:8,  CategoryName:'Accessories', ProductName:'Daniel Wellington Classic Watch', Price:13000, Rating:5,
    ImagePath:'https://us.danielwellington.com/cdn/shop/products/a632d38044c6a937e9dc450156c4f86e26bd4664.png?v=1679995182',
    Description:'Daniel Wellington Classic 36mm in rose gold with a black dial. Interchangeable Italian leather strap, scratch-resistant mineral glass, and a Japanese quartz Miyota movement. Minimalist Scandinavian elegance.'
  },
  {
    ProductID:9,  CategoryName:'Accessories', ProductName:'Channel Pearl Slippers', Price:28999, Rating:5,
    ImagePath:'https://www.chanel.com/images///f_auto,q_auto:good,dpr_1.1/w_3200/-9543237697566.jpg',
    Description:'Chanel velvet slingback flats with interlocking CC and pearl embellishment. Grosgrain ribbon trim, padded leather footbed, and a low stacked heel. From the Métiers d\'Art collection — effortlessly iconic.'
  },
  {
    ProductID:22, CategoryName:'Accessories', ProductName:'Fetch Layered Necklace', Price:2200, Rating:4.8,
    ImagePath:'https://fetch-mkt.com/cdn/shop/files/EG-5186_WHITE-PEARL_01_1000x1500_efa66be4-5450-4d5f-9292-657919a9395a_1024x1024.jpg?v=1703274640',
    Description:'Fetch white freshwater pearl and 14k gold-fill layered necklace. Hand-knotted pearl strand on a delicate gold chain with an adjustable lobster clasp. Dainty, feminine, and made for everyday stacking.'
  },
  {
    ProductID:23, CategoryName:'Accessories', ProductName:'Daniel Wellington Petite Watch', Price:9500, Rating:4.9,
    ImagePath:'https://us.danielwellington.com/cdn/shop/files/af1c700f50fae0ac72f151dee5b2336e0485a590.png?v=1729751732',
    Description:'Daniel Wellington Petite 28mm in rose gold with a clean white dial. Slim case, interchangeable blush leather strap, and a Japanese quartz movement. Understated elegance perfectly sized for a petite wrist.'
  },
  {
    ProductID:24, CategoryName:'Accessories', ProductName:'Burberry Check Belt', Price:18000, Rating:4.7,
    ImagePath:'https://assets.burberry.com/is/image/Burberryltd/9E5023C5-A64E-4DE9-86E3-7F9BDFBE1858',
    Description:'Burberry reversible belt in smooth leather and iconic house check canvas. Pin-buckle closure with an engraved Burberry logo. Two looks in one — the classic that belongs in every wardrobe.'
  },
  {
    ProductID:25, CategoryName:'Accessories', ProductName:'Celine Cat-Eye Frames', Price:35000, Rating:4.8,
    ImagePath:'https://image.celine.com/347719c0a3ee7b80/original/4S187CPLB-38NO_1_FALL21.jpg',
    Description:'Céline optical cat-eye frames in black acetate. Bold upswept silhouette with subtle Triomphe logo at the temples. Statement eyewear crafted for the confident, fashion-forward woman.'
  },

  // ── Make Up ───────────────────────────────────────
  {
    ProductID:10, CategoryName:'Make Up', ProductName:'Burberry Signature Perfume', Price:16000, Rating:5,
    ImagePath:'https://assets.burberry.com/is/image/Burberryltd/170DBE43-9B00-40B1-A766-F1482E6F263D',
    Description:'Burberry Her Eau de Parfum — a bouquet of wild berries, jasmine, and warm tonka bean. Feminine, modern, and unmistakably British. Presented in the iconic tartan-embossed glass bottle.'
  },
  {
    ProductID:26, CategoryName:'Make Up', ProductName:'Channel No. 5 Eau de Parfum', Price:22000, Rating:5,
    ImagePath:'https://www.chanel.com/images///f_auto,q_auto:good,dpr_1.1/w_1024/-9543237304350.jpg',
    Description:'Chanel N°5 Eau de Parfum — the world\'s most iconic fragrance. A floral aldehyde blend of rose, jasmine, ylang-ylang, and sandalwood. First created in 1921 by Ernest Beaux for Gabrielle Chanel.'
  },
  {
    ProductID:27, CategoryName:'Make Up', ProductName:'Celine Lip Gloss Set', Price:4800, Rating:4.8,
    ImagePath:'https://image.celine.com/3a97d0b56dc112bd/original/6LC1C010A-88AD_1_LE-16.jpg',
    Description:'Céline Vinyle Lip Gloss in a trio of wearable shades. High-shine, non-sticky formula with a plumping effect and nourishing botanical extracts. The Paris-perfected pout in a collectible Céline case.'
  },
  {
    ProductID:28, CategoryName:'Make Up', ProductName:'Fetch Glow Highlighter Palette', Price:1900, Rating:4.7,
    ImagePath:'https://fetch-mkt.com/cdn/shop/products/super-blend-w-badges.jpg?v=1585328795',
    Description:'Fetch Super Blend brightening face oil and glow serum. A blend of sea buckthorn, chia seed, and vitamin C that delivers a radiant, dewy finish. Vegan, clean-beauty certified, and clinically tested.'
  },
  {
    ProductID:29, CategoryName:'Make Up', ProductName:'Burberry Fresh Glow Foundation', Price:6500, Rating:4.9,
    ImagePath:'https://assets.burberry.com/is/image/Burberryltd/D3BB2731-F916-4277-B568-7B7CF6B65186',
    Description:'Burberry Ultimate Glow Serum Foundation in a buildable, luminous finish. Hydrating formula enriched with hyaluronic acid and SPF 15. Available in 30 shades — skin-first luxury beauty from Burberry.'
  },
  {
    ProductID:30, CategoryName:'Make Up', ProductName:'Coach Velvet Lipstick Set', Price:3200, Rating:4.6,
    ImagePath:'https://coach.scene7.com/is/image/Coach/c5072_l38_a0?$desktopProduct$',
    Description:'Coach Dreams Velvet Lipstick Collection — a curated set of velvet-finish shades inspired by Coach\'s signature fragrance. Long-wearing conditioning formula with a plush velvet-tip applicator. Wear your dream.'
  },
];

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  updateBadges();
  updateUserBtn();
  renderCart();

  const isDetail   = window.location.pathname.includes('product-details');
  const isCheckout = window.location.pathname.includes('checkout');

  if (isDetail) {
    loadProductDetail();
  } else if (!isCheckout) {
    loadProducts();
  }

  // Live search — fires as user types, debounced 200ms
  let searchTimer;
  document.getElementById('search-input')?.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => handleSearch(), 200);
  });

  // Also allow Enter to trigger immediately
  document.getElementById('search-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { clearTimeout(searchTimer); handleSearch(); }
    if (e.key === 'Escape') exitSearchView();
  });
});
