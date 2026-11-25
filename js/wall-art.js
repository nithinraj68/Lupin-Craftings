(function () {
  var W = window.WALL_ART, LC = window.LC, Cart = LC.Cart, esc = LC.esc;
  var picks = {}, typed = {};
  var $ = function (id) { return document.getElementById(id); };
  var BTN = 'min-height:44px;padding:10px 14px;font-family:inherit;font-size:14px;font-weight:600;border-radius:2px;cursor:pointer;';
  var LABEL = 'font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#55524D';
  function chip(on) { return BTN + 'border:1px solid ' + (on ? '#1F6B40' : '#CFCBC2') + ';background:' + (on ? '#1F6B40' : '#FFFFFF') + ';color:' + (on ? '#FFFFFF' : '#141414'); }
  function sizeOf(m) { var id = picks[m.id] || W.sizes[0].id; return W.sizes.filter(function (s) { return s.id === id; })[0] || W.sizes[0]; }
  function optOf(m) { if (!m.options) return null; var id = picks[m.id + '_o'] || m.options[0].id; return m.options.filter(function (o) { return o.id === id; })[0]; }
  function priceBlock(m, sel) {
    if (m.custom) return '<div><div style="font-size:16px;font-weight:600">Price on request</div></div>';
    if (sel.price != null) return '<div><div style="font-size:18px;font-weight:600">' + LC.money(sel.price) + '</div></div>';
    return '<div><div style="font-size:18px;font-weight:600">' + esc(W.priceRange) + '</div><div style="font-size:13px;color:#55524D;margin-top:2px">' + esc(W.priceNote) + '</div></div>';
  }

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
        m.options.forEach(function (o) { h += '<button type="button" data-m="' + m.id + '" data-o="' + o.id + '" aria-pressed="' + (opt && opt.id === o.id) + '" style="' + chip(opt && opt.id === o.id) + '">' + esc(o.label) + '</button>'; });
        h += '</div></div>';
      }
      if (m.custom) {
        h += '<label style="display:flex;flex-direction:column;gap:8px"><span style="' + LABEL + '">Your size</span><input type="text" data-size-input="' + m.id + '" value="' + esc(typed[m.id] || '') + '" placeholder="e.g. 3 ft wide, or any size you like" style="min-height:44px;padding:10px 12px;border:1px solid #CFCBC2;border-radius:2px;font-family:inherit;font-size:14px;color:#141414;background:#FFFFFF"></label>';
      } else {
        h += '<div style="display:flex;flex-direction:column;gap:8px"><span style="' + LABEL + '">Choose size</span><div style="display:flex;flex-wrap:wrap;gap:8px">';
        W.sizes.forEach(function (s) { h += '<button type="button" data-m="' + m.id + '" data-s="' + s.id + '" aria-pressed="' + (sel.id === s.id) + '" style="' + chip(sel.id === s.id) + '">' + esc(s.label) + '</button>'; });
        h += '</div></div>';
      }
      if (m.note) h += '<p style="margin:0;font-size:14px;line-height:1.6;color:#55524D">' + esc(m.note) + '</p>';
      h += priceBlock(m, sel);
      h += '<button type="button" class="wa-add" data-add="' + m.id + '" style="min-height:48px;padding:12px 20px;border:0;background:#1F6B40;color:#FFFFFF;font-family:inherit;font-size:15px;font-weight:600;border-radius:2px;cursor:pointer">Add to cart</button>';
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
      Cart.add({
        key: m.id + ':' + (m.custom ? sizeLabel : sel.id) + ':' + (opt ? opt.id : ''),
        name: m.name + (opt ? ' (' + opt.label + ')' : ''), custom: !!m.custom, size: sizeLabel,
        price: m.custom ? null : sel.price, priceText: m.custom ? 'Price on request' : W.priceRange
      });
      // clear visible feedback on the button, a message, and a bump on the header cart
      b.textContent = '✓ Added to cart'; b.style.background = '#17552F'; b.disabled = true;
      setTimeout(function () { b.textContent = 'Add to cart'; b.style.background = '#1F6B40'; b.disabled = false; }, 1600);
      LC.toast('Added to cart: ' + m.name);
      var cb = document.getElementById('lc-cart-btn');
      if (cb) { cb.classList.remove('bump'); void cb.offsetWidth; cb.classList.add('bump'); }
    }
  });
  $('wa-grid').addEventListener('input', function (e) {
    var id = e.target.getAttribute && e.target.getAttribute('data-size-input');
    if (id) typed[id] = e.target.value;
  });

  function renderCart() {
    var items = Cart.items(), count = Cart.count();
    $('cart-empty').hidden = count > 0;
    var full = $('cart-full'); full.hidden = count === 0; full.style.display = count ? 'flex' : 'none';
    $('cart-items').innerHTML = items.map(function (c, i) {
      return '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;padding:18px 0;border-top:1px solid #E2E0DA">' +
        '<div style="flex:1 1 200px;min-width:0;display:flex;flex-direction:column;gap:4px"><span style="font-family:\'Cormorant Garamond\',serif;font-weight:600;font-size:24px">' + esc(c.name) + '</span><span style="font-size:14px;color:#55524D">' + esc(c.size) + ' · ' + esc(Cart.priceLabel(c)) + '</span></div>' +
        '<div style="display:flex;align-items:center;gap:8px"><button type="button" aria-label="Decrease quantity" data-dec="' + i + '" style="width:44px;height:44px;border:1px solid #CFCBC2;background:#FFFFFF;color:#141414;font-family:inherit;font-size:20px;border-radius:2px;cursor:pointer">−</button>' +
        '<span style="min-width:28px;text-align:center;font-size:16px;font-weight:600">' + c.qty + '</span>' +
        '<button type="button" aria-label="Increase quantity" data-inc="' + i + '" style="width:44px;height:44px;border:1px solid #CFCBC2;background:#FFFFFF;color:#141414;font-family:inherit;font-size:20px;border-radius:2px;cursor:pointer">+</button></div>' +
        '<button type="button" data-rm="' + i + '" style="min-height:44px;padding:10px 14px;border:0;background:transparent;color:#55524D;font-family:inherit;font-size:14px;text-decoration:underline;cursor:pointer">Remove</button></div>';
    }).join('');
    var tot = $('cart-total'); tot.hidden = !Cart.allPriced();
    if (Cart.allPriced()) tot.textContent = 'Total: ' + LC.money(Cart.total());
    $('cart-summary').textContent = Cart.summary();
    $('cart-wa').href = LC.wa(Cart.summary());
  }
  $('cart-items').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-inc')) Cart.inc(+b.getAttribute('data-inc'));
    else if (b.hasAttribute('data-dec')) Cart.dec(+b.getAttribute('data-dec'));
    else if (b.hasAttribute('data-rm')) Cart.remove(+b.getAttribute('data-rm'));
  });
  function copySummary(done) {
    var pre = $('cart-summary');
    function sel() { var r = document.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); LC.toast('Press Ctrl+C to copy'); }
    try { navigator.clipboard.writeText(Cart.summary()).then(function () { LC.toast('Order summary copied'); if (done) done(); }, sel); } catch (e) { sel(); }
  }
  $('cart-copy').addEventListener('click', function () { copySummary(); });
  // Instagram cannot be pre-filled, so copy the order first, then open the message window
  $('cart-ig').addEventListener('click', function () { try { navigator.clipboard.writeText(Cart.summary()); LC.toast('Order copied. Paste it in the Instagram message.'); } catch (e) {} });
  var ic = document.querySelector('[data-icon="wa"]'); if (ic) ic.innerHTML = LC.ICON.wa;
  Cart.onChange(renderCart);
  renderGrid(); renderCart();
})();
