/* Shared header, footer, cart, language switcher and contact links. */
(function () {
  var S = window.SITE || {};
  var GREEN = '#1F6B40', GOLD = '#A6842F';
  var WA = 'https://wa.me/' + S.whatsapp;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function wa(text) { return WA + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function svg(inner, size) { return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>'; }
  var ICON = {
    cart: svg('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>', 22),
    ig: svg('<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>', 20),
    wa: svg('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>', 20),
    globe: svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', 16),
    user: svg('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', 16)
  };

  /* ---------------- Cart (shared by every page, saved in the browser) ---------------- */
  var KEY = 'lc-cart', items = [], subs = [];
  function load() { try { items = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { items = []; } }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} fire(); }
  function fire() { subs.forEach(function (f) { try { f(); } catch (e) {} }); }
  load();
  window.addEventListener('storage', function (e) { if (e.key === KEY) { load(); fire(); } });
  function money(p) { return '₹' + Number(p).toLocaleString('en-IN'); }
  var Cart = {
    items: function () { return items; },
    count: function () { return items.reduce(function (n, c) { return n + c.qty; }, 0); },
    priceLabel: function (c) { return c.price != null ? money(c.price) : (c.priceText || 'Price on request'); },
    allPriced: function () { return items.length > 0 && items.every(function (c) { return c.price != null; }); },
    total: function () { return items.reduce(function (n, c) { return n + (c.price || 0) * c.qty; }, 0); },
    add: function (it) {
      var f = items.filter(function (c) { return c.key === it.key; })[0];
      if (f) f.qty++; else { it.qty = 1; items.push(it); }
      persist();
    },
    inc: function (i) { if (items[i]) { items[i].qty++; persist(); } },
    dec: function (i) { if (items[i]) { items[i].qty = Math.max(1, items[i].qty - 1); persist(); } },
    remove: function (i) { items.splice(i, 1); persist(); },
    onChange: function (f) { subs.push(f); },
    summary: function () {
      var t = "Hi Lupin Craftings, I'd like to order:\n" + items.map(function (c) { return c.qty + ' x ' + c.name + ', ' + c.size; }).join('\n');
      if (items.some(function (c) { return c.custom; })) t += "\n\nFor the custom item(s), I'll send the vehicle model, year and photo (or logo file / design details) here.";
      t += '\n\nPlease confirm the price and delivery.';
      return t;
    }
  };

  /* ---------------- Toast ---------------- */
  var toastEl, toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div'); toastEl.className = 'lc-toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2200);
  }

  /* ---------------- Language ---------------- */
  var LANGS = [['en', 'English'], ['hi', 'हिन्दी (Hindi)'], ['ta', 'தமிழ் (Tamil)'], ['te', 'తెలుగు (Telugu)'], ['ml', 'മലയാളം (Malayalam)'], ['kn', 'ಕನ್ನಡ (Kannada)'], ['mr', 'मराठी (Marathi)'], ['bn', 'বাংলা (Bengali)'], ['gu', 'ગુજરાતી (Gujarati)'], ['pa', 'ਪੰਜਾਬੀ (Punjabi)'], ['ar', 'العربية (Arabic)'], ['fr', 'Français'], ['de', 'Deutsch'], ['es', 'Español']];
  function currentLang() { var m = document.cookie.match(/(?:^|; )googtrans=\/[^\/]*\/([A-Za-z\-]+)/); return m ? m[1] : 'en'; }
  function clearCookie() {
    var past = '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'googtrans' + past;
    document.cookie = 'googtrans' + past + '; domain=' + location.hostname;
  }
  function setLang(code) {
    try { localStorage.setItem('lc-lang', code); } catch (e) {}
    clearCookie();
    if (code !== 'en') document.cookie = 'googtrans=/en/' + code + '; path=/';
    location.reload();
  }
  (function autoLang() {
    var stored = null; try { stored = localStorage.getItem('lc-lang'); } catch (e) {}
    if (stored) return;
    var pick = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase().split('-')[0];
    var ok = LANGS.some(function (l) { return l[0] === pick; });
    if (ok && pick !== 'en') { setLang(pick); return; }
    try { localStorage.setItem('lc-lang', 'en'); } catch (e) {}
  })();
  window.lcTranslateInit = function () {
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
  };
  var lang = currentLang();
  if (lang !== 'en') {
    document.documentElement.lang = lang;
    var gt = document.createElement('script'); gt.src = 'https://translate.google.com/translate_a/element.js?cb=lcTranslateInit'; gt.async = true;
    document.head.appendChild(gt);
  }

  /* ---------------- Header ---------------- */
  var NAV = [
    ['home', 'index.html', 'Home'], ['covers', 'car-covers.html', 'Car Covers'],
    ['tyres', 'tyre-cushions.html', 'Tyre Cushions'], ['wallart', 'wall-art.html', 'Wall Art'],
    ['tabletop', 'tabletop.html', 'Tabletop'], ['microfiber', 'microfiber.html', 'Microfiber'],
    ['esteem', 'esteem.html', 'Esteem'], ['reviews', 'reviews.html', 'Reviews']
  ];
  var h = document.getElementById('site-header');
  if (h) {
    var active = h.getAttribute('data-active');
    var links = NAV.map(function (n) {
      var on = n[0] === active;
      return '<a class="lc-navlink' + (on ? ' on' : '') + '" href="' + n[1] + '">' + n[2] + '</a>';
    }).join('');
    var langOpts = LANGS.map(function (l) { return '<option value="' + l[0] + '"' + (l[0] === lang ? ' selected' : '') + '>' + l[1] + '</option>'; }).join('');
    h.className = 'lc-header';
    h.removeAttribute('style');
    h.innerHTML =
      '<div class="lc-util"><div class="lc-wrap lc-util-in">' +
        '<span class="lc-util-left">Official distributor of SM CarDress &amp; Tyredox in India</span>' +
        '<div class="lc-util-right">' +
          '<label class="lc-lang notranslate" translate="no">' + ICON.globe + '<select id="lc-lang" aria-label="Language">' + langOpts + '</select></label>' +
          '<button type="button" id="lc-login-btn" class="lc-util-btn">' + ICON.user + '<span id="lc-login-label">Login</span></button>' +
        '</div></div></div>' +
      '<div class="lc-wrap lc-main">' +
        '<a href="index.html" class="lc-brand"><img src="' + S.logo + '" alt="Lupin Craftings logo"><span class="lc-brand-name notranslate" translate="no"><span style="color:' + GREEN + '">L</span>upin <span style="color:' + GOLD + '">C</span>raftings</span></a>' +
        '<nav class="lc-nav" aria-label="Main">' + links +
          '<span class="lc-cartwrap"><button type="button" id="lc-cart-btn" class="lc-cartbtn" aria-haspopup="true" aria-expanded="false" aria-controls="lc-cart-panel" aria-label="Open cart">' + ICON.cart + '<span class="lc-cart-text">Cart</span><span id="lc-cart-count" class="lc-badge" hidden>0</span></button></span>' +
          '<a class="lc-contactbtn" href="contact.html">Contact us</a>' +
        '</nav></div>';
    var sel = document.getElementById('lc-lang');
    sel.addEventListener('change', function () { setLang(sel.value); });
  }
  var gtDiv = document.createElement('div'); gtDiv.id = 'google_translate_element'; gtDiv.style.display = 'none'; document.body.appendChild(gtDiv);

  /* ---------------- Cart dropdown ---------------- */
  var panel = document.createElement('div');
  panel.id = 'lc-cart-panel'; panel.className = 'lc-cartpanel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Your cart');
  document.body.appendChild(panel);
  function renderCartUI() {
    var n = Cart.count();
    var badge = document.getElementById('lc-cart-count');
    if (badge) { badge.textContent = n; badge.hidden = n === 0; }
    var btn = document.getElementById('lc-cart-btn');
    if (btn) btn.setAttribute('aria-label', 'Open cart, ' + n + (n === 1 ? ' item' : ' items'));
    if (panel.hidden) return;
    var html = '<div class="lc-cp-head"><strong>Your cart</strong><button type="button" class="lc-cp-x" data-close aria-label="Close cart">&times;</button></div>';
    if (!items.length) {
      html += '<p class="lc-cp-empty">Your cart is empty. Choose a product on the <a href="wall-art.html">Wall Art</a> page and add it here.</p>';
    } else {
      html += '<div class="lc-cp-list">' + items.map(function (c, i) {
        return '<div class="lc-cp-row"><div class="lc-cp-info"><span class="lc-cp-name">' + esc(c.name) + '</span><span class="lc-cp-sub">' + esc(c.size) + ' · ' + esc(Cart.priceLabel(c)) + '</span></div>' +
          '<div class="lc-cp-qty"><button type="button" data-dec="' + i + '" aria-label="Decrease quantity">−</button><span>' + c.qty + '</span><button type="button" data-inc="' + i + '" aria-label="Increase quantity">+</button></div>' +
          '<button type="button" class="lc-cp-rm" data-rm="' + i + '">Remove</button></div>';
      }).join('') + '</div>';
      if (Cart.allPriced()) html += '<div class="lc-cp-total">Total: ' + money(Cart.total()) + '</div>';
      html += '<div class="lc-cp-actions"><a class="lc-cp-primary" href="' + wa(Cart.summary()) + '" target="_blank" rel="noopener noreferrer">' + ICON.wa + ' Order on WhatsApp</a>' +
        '<a class="lc-cp-secondary" href="wall-art.html#cart">View full cart</a></div>' +
        '<p class="lc-cp-note">Online payment is not set up yet. We confirm the price and delivery on WhatsApp.</p>';
    }
    panel.innerHTML = html;
  }
  function placePanel() {
    var btn = document.getElementById('lc-cart-btn'); if (!btn) return;
    var r = btn.getBoundingClientRect();
    var w = Math.min(360, window.innerWidth - 32);
    panel.style.width = w + 'px';
    var left = Math.max(16, Math.min(r.right - w, window.innerWidth - w - 16)) + window.pageXOffset;
    panel.style.left = left + 'px';
    panel.style.top = (r.bottom + window.pageYOffset + 8) + 'px';
  }
  function openPanel() {
    panel.hidden = false; renderCartUI(); placePanel();
    var b = document.getElementById('lc-cart-btn'); if (b) b.setAttribute('aria-expanded', 'true');
  }
  function closePanel() {
    panel.hidden = true;
    var b = document.getElementById('lc-cart-btn'); if (b) b.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', function (e) {
    var btn = document.getElementById('lc-cart-btn');
    if (btn && btn.contains(e.target)) { panel.hidden ? openPanel() : closePanel(); return; }
    if (panel.contains(e.target)) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-close')) closePanel();
      else if (t.hasAttribute('data-inc')) Cart.inc(+t.getAttribute('data-inc'));
      else if (t.hasAttribute('data-dec')) Cart.dec(+t.getAttribute('data-dec'));
      else if (t.hasAttribute('data-rm')) Cart.remove(+t.getAttribute('data-rm'));
      return;
    }
    if (!panel.hidden) closePanel();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { closePanel(); var b = document.getElementById('lc-cart-btn'); if (b) b.focus(); } });
  window.addEventListener('resize', function () { if (!panel.hidden) placePanel(); });
  Cart.onChange(renderCartUI);
  renderCartUI();

  /* ---------------- Footer ---------------- */
  var f = document.getElementById('site-footer');
  if (f) {
    f.className = 'lc-footer';
    f.innerHTML = '<div class="lc-wrap lc-footer-in">' +
      '<img src="' + S.logo + '" alt="Lupin Craftings logo" style="height:64px;width:auto;display:block">' +
      '<div class="lc-footer-text">&copy; ' + new Date().getFullYear() + ' Lupin Craftings. ' + esc(S.footerText) + '<br>' + esc(S.address) + '</div>' +
      '<div class="lc-social">' +
        '<a href="' + esc(S.instagram) + '" target="_blank" rel="noopener noreferrer" aria-label="Lupin Craftings on Instagram (opens in a new tab)">' + ICON.ig + '<span>Instagram</span></a>' +
        '<a href="' + wa('Hi Lupin Craftings') + '" target="_blank" rel="noopener noreferrer" aria-label="Message us on WhatsApp (opens in a new tab)">' + ICON.wa + '<span>WhatsApp</span></a>' +
      '</div></div>';
  }

  /* ---------------- Contact details and links ---------------- */
  function phoneLinks() {
    return S.phones.map(function (p) { return '<a class="lc-tel" href="' + wa('Hi Lupin Craftings') + '" target="_blank" rel="noopener noreferrer" title="Message us on WhatsApp">' + esc(p) + '</a>'; }).join(' · ');
  }
  function fillHTML(sel, html) { Array.prototype.forEach.call(document.querySelectorAll(sel), function (e) { e.innerHTML = html; }); }
  fillHTML('[data-phones]', phoneLinks());
  fillHTML('[data-email]', '<a class="lc-tel" href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a>');
  fillHTML('[data-address]', esc(S.address));
  fillHTML('[data-contact-line]', 'Phone / WhatsApp: ' + phoneLinks() + ' · Email: <a class="lc-tel" href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a>');
  Array.prototype.forEach.call(document.querySelectorAll('a[data-instagram]'), function (a) { a.href = S.instagram; });
  // Message buttons: open Instagram messages, and add a WhatsApp button next to each
  Array.prototype.forEach.call(document.querySelectorAll('a[data-ig-dm]'), function (a) {
    var style = (a.getAttribute('style') || '') + ';display:inline-flex;align-items:center;justify-content:center;gap:8px';
    var label = a.textContent.trim();
    a.href = S.instagramDM; a.setAttribute('style', style);
    a.innerHTML = ICON.ig + '<span>' + esc(label) + '</span>';
    if (!a.hasAttribute('data-no-wa')) {
      var w = a.cloneNode(true);
      w.removeAttribute('data-ig-dm'); w.href = wa('Hi Lupin Craftings, I would like to know more.');
      w.innerHTML = ICON.wa + '<span>Message us on WhatsApp</span>';
      a.parentNode.insertBefore(w, a.nextSibling);
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="http"]'), function (a) {
    if (a.hostname !== location.hostname) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  });

  window.LC = { S: S, Cart: Cart, toast: toast, wa: wa, esc: esc, money: money, ICON: ICON, openCart: openPanel, GREEN: GREEN, GOLD: GOLD };
})();
