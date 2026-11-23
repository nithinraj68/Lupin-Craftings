(function () {
  var $ = function (id) { return document.getElementById(id); };
  var err = $('enq-error'), out = $('enq-out'), txt = $('enq-text'), copyBtn = $('enq-copy');
  var val = function (id) { return ($(id).value || '').trim(); };
  $('enq-prepare').addEventListener('click', function () {
    var name = val('lc-name'), phone = val('lc-phone'), email = val('lc-email');
    if (!name || (!phone && !email)) {
      err.textContent = 'Please add your name and a phone number or email.';
      err.hidden = false; out.hidden = true; return;
    }
    err.hidden = true;
    var lines = ["Hi Lupin Craftings, I'd like to enquire.", 'Name: ' + name];
    if (phone) lines.push('Phone: ' + phone);
    if (email) lines.push('Email: ' + email);
    lines.push('Interested in: ' + (val('lc-interest') || 'Not specified'));
    if (val('lc-vehicle')) lines.push('Vehicle: ' + val('lc-vehicle'));
    if (val('lc-message')) lines.push('Message: ' + val('lc-message'));
    txt.textContent = lines.join('\n');
    out.hidden = false; out.style.display = 'flex'; copyBtn.textContent = 'Copy message';
  });
  copyBtn.addEventListener('click', function () {
    function done() { copyBtn.textContent = 'Copied'; }
    try { navigator.clipboard.writeText(txt.textContent).then(done, function () { selectText(); }); } catch (e) { selectText(); }
    function selectText() {
      var r = document.createRange(); r.selectNodeContents(txt);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      copyBtn.textContent = 'Press Ctrl+C to copy';
    }
  });
})();
