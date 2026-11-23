/* Shared header, footer and contact details. Pages stay the same; edit js/content.js for details. */
(function () {
  var S = window.SITE;
  var NAV = [
    ['home', 'index.html', 'Home'], ['covers', 'car-covers.html', 'Car Covers'],
    ['tyres', 'tyre-cushions.html', 'Tyre Cushions'], ['wallart', 'wall-art.html', 'Wall Art'],
    ['tabletop', 'tabletop.html', 'Tabletop'], ['microfiber', 'microfiber.html', 'Microfiber'],
    ['esteem', 'esteem.html', 'Esteem']
  ];
  var h = document.getElementById('site-header');
  if (h) {
    var active = h.getAttribute('data-active');
    var links = NAV.map(function (n) {
      var on = n[0] === active;
      return '<a href="' + n[1] + '" style="padding:14px 0 12px;color:' + (on ? '#1F6B40;font-weight:600' : '#55524D') + ';border-bottom:2px solid ' + (on ? '#1F6B40' : 'transparent') + '">' + n[2] + '</a>';
    }).join('');
    if (h.hasAttribute('data-cart')) links += '<a href="#cart" id="cart-link" style="padding:14px 0 12px;color:#141414;font-weight:600;border-bottom:2px solid transparent">Cart (0)</a>';
    links += '<a href="contact.html" style="padding:12px 22px;background:#1F6B40;color:#FFFFFF;font-weight:600;border-radius:2px">Contact us</a>';
    h.style.cssText = 'background:#FFFFFF;border-bottom:1px solid #E2E0DA';
    h.innerHTML = '<div style="max-width:1200px;margin:0 auto;padding:6px 24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 28px">' +
      '<a href="index.html" style="display:flex;align-items:center"><img src="' + S.logo + '" alt="Lupin Craftings, have faith in us" style="height:72px;width:auto;display:block"></a>' +
      '<nav style="display:flex;flex-wrap:wrap;align-items:center;gap:0 22px;font-size:15px">' + links + '</nav></div>';
  }
  var f = document.getElementById('site-footer');
  if (f) {
    f.style.cssText = 'background:#F6F5F2;border-top:1px solid #E2E0DA';
    f.innerHTML = '<div style="max-width:1200px;margin:0 auto;padding:32px 24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:20px 32px">' +
      '<img src="' + S.logo + '" alt="Lupin Craftings logo" style="height:64px;width:auto;display:block">' +
      '<div style="flex:1 1 360px;min-width:0;font-size:14px;line-height:1.7;color:#55524D">&copy; ' + new Date().getFullYear() + ' Lupin Craftings. ' + S.footerText + '<br>' + S.address + '</div>' +
      '<a href="' + S.instagram + '" style="font-size:15px;font-weight:600;color:#1F6B40">Instagram</a></div>';
  }
  function fill(sel, text) { Array.prototype.forEach.call(document.querySelectorAll(sel), function (e) { e.textContent = text; }); }
  fill('[data-phones]', S.phones.join(' · '));
  fill('[data-email]', S.email);
  fill('[data-address]', S.address);
  fill('[data-contact-line]', 'Phone: ' + S.phones.join(' · ') + ' · Email: ' + S.email);
  Array.prototype.forEach.call(document.querySelectorAll('a[data-instagram]'), function (a) { a.href = S.instagram; });
})();
