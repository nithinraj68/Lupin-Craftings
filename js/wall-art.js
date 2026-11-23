(function () {
  var W = window.WALL_ART, S = window.SITE;
  var picks = {}, typed = {}, cart = [];
  try { cart = JSON.parse(localStorage.getItem('lc-cart') || '[]') || []; } catch (e) { cart = []; }
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var price = function (p) { return p == null ? 'Price on request' : '₹' + Number(p).toLocaleString('en-IN'); };
  var BTN = 'min-height:44px;padding:10px 14px;font-family:inherit;font-size:14px;font-weight:600;border-radius:2px;cursor:pointer;';
  var LABEL = 'font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#55524D';
  function chip(on) { return BTN + 'border:1px solid ' + (on ? '#1F6B40' : '#CFCBC2') + ';background:' + (on ? '#1F6B40' : '#FFFFFF') + ';color:' + (on ? '#FFFFFF' : '#141414'); }
  function save() { try { localStorage.setItem('lc-cart', JSON.stringify(cart)); } catch (e) {} }

  function sizeOf(m) { var id = picks[m.id] || W.sizes[0].id; return W.sizes.filter(function (s) { return s.id === id; })[0] || W.sizes[0]; }
  function optOf(m) { if (!m.options) return null; var id = picks[m.id + '_o'] || m.options[0].id; return m.options.filter(function (o) { return o.id === id; })[0]; }

  function renderGrid() {
    var grid = $('wa-grid');
    var focused = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute('data-size-input');
    grid.innerHTML = W.models.map(function (m) {
      var sel = sizeOf(m), opt = optOf(m), h = '';
      h += '<div class="wa-card">';
      h += '<img src="' + esc(m.img) + '" alt="' + esc(m.alt || m.name) + '" loading="lazy" style="display:block;width:100%;aspect-ratio:1/1;object-fit:contain;background:#F6F5F2">';
      h += '<div class="wa-body">';
      h += '<h3 class="wa-name">' + esc(m.name) + '</h3>';
      if (m.options) {
        h += '<div style="display:flex;flex-direction:column;gap:8px"><span style="' + LABEL + '">Style</span><div style="display:flex;flex-wrap:wrap;gap:8px">';
        m.options.forEach(function (o) { h += '<button type="button" data-m="' + m.id + '" data-o="' + o.id + '" style="' + chip(opt && opt.id === o.id) + '">' + esc(o.label) + '</button>'; });
        h += '</div></div>';
      }
      if (m.custom) {
        h += '<label style="display:flex;flex-direction:column;gap:8px"><span style="' + LABEL + '">Your size</span><input type="text" data-size-input="' + m.id + '" value="' + esc(typed[m.id] || '') + '" placeholder="e.g. 3 ft wide, or any size you like" style="min-height:44px;padding:10px 12px;border:1px solid #CFCBC2;border-radius:2px;font-family:inherit;font-size:14px;color:#141414;background:#FFFFFF"></label>';
      } else {
        h += '<div style="display:flex;flex-direction:column;gap:8px"><span style="' + LABEL + '">Choose size</span><div style="display:flex;flex-wrap:wrap;gap:8px">';
        W.sizes.forEach(function (s) { h += '<button type="button" data-m="' + m.id + '" data-s="' + s.id + '" style="' + chip(sel.id === s.id) + '">' + esc(s.label) + '</button>'; });
        h += '</div></div>';
      }
      if (m.note) h += '<p style="margin:0;font-size:14px;line-height:1.6;color:#55524D">' + esc(m.note) + '</p>';
      h += '<div style="font-size:16px;font-weight:600;margin-top:auto">' + (m.custom ? 'Price on request' : price(sel.price)) + '</div>';
      h += '<button type="button" data-add="' + m.id + '" style="min-height:48px;padding:12px 20px;border:0;background:#1F6B40;color:#FFFFFF;font-family:inherit;font-size:15px;font-weight:600;border-radius:2px;cursor:pointer">Add to cart</button>';
      h += '</div></div>';
      return h;
    }).join('');
    if (focused) { var el = grid.querySelector('[data-size-input="' + focused + '"]'); if (el) el.focus(); }
  }
  function model(id) { return W.models.filter(function (m) { return m.id === id; })[0]; }

  $('wa-grid').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var mid = b.getAttribute('data-m');
    if (b.hasAttribute('data-s')) { picks[mid] = b.getAttribute('data-s'); renderGrid(); }
    else if (b.hasAttribute('data-o')) { picks[mid + '_o'] = b.getAttribute('data-o'); renderGrid(); }
    else if (b.hasAttribute('data-add')) {
      var m = model(b.getAttribute('data-add')), sel = sizeOf(m), opt = optOf(m);
      var t = (typed[m.id] || '').trim();
      var sizeLabel = m.custom ? (t ? 'Size: ' + t : 'Size to be confirmed') : sel.label;
      var key = m.id + ':' + (m.custom ? sizeLabel : sel.id) + ':' + (opt ? opt.id : '');
      var found = cart.filter(function (c) { return c.key === key; })[0];
      if (found) found.qty++;
      else cart.push({ key: key, name: m.name + (opt ? ' (' + opt.label + ')' : ''), custom: !!m.custom, size: sizeLabel, price: m.custom ? null : sel.price, qty: 1 });
      save(); renderCart();
    }
  });
  $('wa-grid').addEventListener('input', function (e) {
    var id = e.target.getAttribute && e.target.getAttribute('data-size-input');
    if (id) typed[id] = e.target.value;
  });

  function summary() {
    var t = "Hi Lupin Craftings, I'd like to order:\n" + cart.map(function (c) { return c.qty + ' x ' + c.name + ', ' + c.size; }).join('\n');
    if (cart.some(function (c) { return c.custom; })) t += "\n\nFor the custom item(s), I'll send the vehicle model, year and photo (or logo file / design details) here.";
    return t;
  }
  function renderCart() {
    var count = cart.reduce(function (n, c) { return n + c.qty; }, 0);
    var link = $('cart-link'); if (link) link.textContent = 'Cart (' + count + ')';
    $('cart-empty').hidden = count > 0;
    var full = $('cart-full'); full.hidden = count === 0; full.style.display = count ? 'flex' : 'none';
    $('cart-items').innerHTML = cart.map(function (c, i) {
      return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;padding:18px 0;border-top:1px solid #E2E0DA">' +
        '<div style="flex:1 1 200px;min-width:0;display:flex;flex-direction:column;gap:4px"><span style="font-family:\'Cormorant Garamond\',serif;font-weight:600;font-size:24px">' + esc(c.name) + '</span><span style="font-size:14px;color:#55524D">' + esc(c.size) + ' · ' + price(c.price) + '</span></div>' +
        '<div style="display:flex;align-items:center;gap:8px"><button type="button" aria-label="Decrease quantity" data-dec="' + i + '" style="width:44px;height:44px;border:1px solid #CFCBC2;background:#FFFFFF;color:#141414;font-family:inherit;font-size:20px;border-radius:2px;cursor:pointer">−</button>' +
        '<span style="min-width:28px;text-align:center;font-size:16px;font-weight:600">' + c.qty + '</span>' +
        '<button type="button" aria-label="Increase quantity" data-inc="' + i + '" style="width:44px;height:44px;border:1px solid #CFCBC2;background:#FFFFFF;color:#141414;font-family:inherit;font-size:20px;border-radius:2px;cursor:pointer">+</button></div>' +
        '<button type="button" data-rm="' + i + '" style="min-height:44px;padding:10px 14px;border:0;background:transparent;color:#55524D;font-family:inherit;font-size:14px;text-decoration:underline;cursor:pointer">Remove</button></div>';
    }).join('');
    var priced = cart.length && cart.every(function (c) { return c.price != null; });
    var tot = $('cart-total'); tot.hidden = !priced;
    if (priced) tot.textContent = 'Total: ' + price(cart.reduce(function (n, c) { return n + c.price * c.qty; }, 0));
    $('cart-summary').textContent = summary();
    $('cart-copy').textContent = 'Copy order summary';
  }
  $('cart-items').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-inc')) cart[+b.getAttribute('data-inc')].qty++;
    else if (b.hasAttribute('data-dec')) { var c = cart[+b.getAttribute('data-dec')]; c.qty = Math.max(1, c.qty - 1); }
    else if (b.hasAttribute('data-rm')) cart.splice(+b.getAttribute('data-rm'), 1);
    save(); renderCart();
  });
  $('cart-copy').addEventListener('click', function () {
    var btn = this, pre = $('cart-summary');
    function sel() { var r = document.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Press Ctrl+C to copy'; }
    try { navigator.clipboard.writeText(summary()).then(function () { btn.textContent = 'Copied'; }, sel); } catch (e) { sel(); }
  });
  renderGrid(); renderCart();
})();
