(function () {
  var LC = window.LC;
  var $ = function (id) { return document.getElementById(id); };
  var err = $('enq-error'), out = $('enq-out'), txt = $('enq-text');
  var val = function (id) { return ($(id).value || '').trim(); };
  var ic = document.querySelector('[data-icon="wa"]'); if (ic) ic.innerHTML = LC.ICON.wa;

  function fieldErr(id, msg) {
    var e = $(id + '-err'), inp = $(id);
    if (msg) { e.textContent = msg; e.hidden = false; inp.setAttribute('aria-invalid', 'true'); inp.style.borderColor = '#9B2C1F'; }
    else { e.hidden = true; inp.removeAttribute('aria-invalid'); inp.style.borderColor = '#CFCBC2'; }
  }
  function validate() {
    var ok = true, first = null;
    var name = val('lc-name'), phone = val('lc-phone'), email = val('lc-email');
    var digits = phone.replace(/\D/g, '');
    var checks = [
      ['lc-name', name.length < 2 ? 'Please enter your name.' : ''],
      ['lc-phone', digits.length < 10 || digits.length > 15 ? 'Please enter a valid phone number (at least 10 digits).' : ''],
      ['lc-email', !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? 'Please enter a valid email address.' : '']
    ];
    checks.forEach(function (c) { fieldErr(c[0], c[1]); if (c[1]) { ok = false; if (!first) first = c[0]; } });
    if (!ok) { err.textContent = 'Please fill in the fields marked * before sending.'; err.hidden = false; $(first).focus(); }
    else err.hidden = true;
    return ok;
  }
  ['lc-name', 'lc-phone', 'lc-email'].forEach(function (id) { $(id).addEventListener('input', function () { if (!$(id + '-err').hidden) fieldErr(id, ''); }); });

  function buildText() {
    var lines = ["Hi Lupin Craftings, I'd like to enquire.", 'Name: ' + val('lc-name'), 'Phone: ' + val('lc-phone'), 'Email: ' + val('lc-email'),
      'Interested in: ' + (val('lc-interest') || 'Not specified')];
    if (val('lc-vehicle')) lines.push('Vehicle: ' + val('lc-vehicle'));
    if (val('lc-message')) lines.push('Message: ' + val('lc-message'));
    return lines.join('\n');
  }
  function save(channel) {      // keeps a record in your database when it is set up (optional)
    try { if (window.LCAuth && window.LCAuth.saveEnquiry) window.LCAuth.saveEnquiry({ name: val('lc-name'), phone: val('lc-phone'), email: val('lc-email'), interest: val('lc-interest'), vehicle: val('lc-vehicle'), message: val('lc-message'), channel: channel }); } catch (e) {}
  }
  function copy(then) {
    try { navigator.clipboard.writeText(txt.textContent).then(function () { if (then) then(true); }, function () { if (then) then(false); }); } catch (e) { if (then) then(false); }
  }

  $('enq-prepare').addEventListener('click', function () {
    if (!validate()) { out.hidden = true; return; }
    txt.textContent = buildText();
    $('enq-wa').href = LC.wa(txt.textContent);
    out.hidden = false; out.style.display = 'flex';
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  $('enq-wa').addEventListener('click', function () { save('whatsapp'); });
  $('enq-ig').addEventListener('click', function () { copy(function (ok) { LC.toast(ok ? 'Message copied. Paste it in the Instagram chat.' : 'Copy the message below and paste it in Instagram.'); }); save('instagram'); });
  $('enq-copy').addEventListener('click', function () { copy(function (ok) { LC.toast(ok ? 'Message copied' : 'Press Ctrl+C after selecting the message'); }); });
})();
