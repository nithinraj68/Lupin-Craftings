/* Login / sign up (email, phone and password) saved in your Supabase project.
   Setup steps are in SETUP-BACKEND.md. Until js/content.js has the two Supabase values, login shows "coming soon". */
(function () {
  var LC = window.LC, esc = LC.esc;
  var cfg = window.LC_BACKEND || {};
  var configured = !!(cfg.url && cfg.anonKey);
  var client = null, user = null, profile = null, admin = false, subs = [];
  var resolveReady, ready = new Promise(function (r) { resolveReady = r; });

  function firstName() { var n = (profile && profile.name) || (user && user.user_metadata && user.user_metadata.name) || (user && user.email) || ''; return String(n).split(/[\s@]/)[0]; }
  function notify() { subs.forEach(function (f) { try { f(); } catch (e) {} }); }
  function updateButton() {
    var l = document.getElementById('lc-login-label'); if (!l) return;
    l.textContent = user ? 'Hi, ' + firstName() : 'Login';
  }

  async function refresh() {
    var s = (await client.auth.getSession()).data.session;
    user = s ? s.user : null; profile = null; admin = false;
    if (user) {
      try {
        var p = await client.from('profiles').select('name,phone,email').eq('id', user.id).maybeSingle(); profile = p.data;
        var a = await client.from('admins').select('email').maybeSingle(); admin = !!a.data;
      } catch (e) {}
    }
    updateButton(); notify();
  }
  function loadLib() {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  async function init() {
    if (!configured) { resolveReady(); return; }
    try {
      await loadLib();
      client = window.supabase.createClient(cfg.url, cfg.anonKey);
      client.auth.onAuthStateChange(function (ev) {
        if (ev === 'PASSWORD_RECOVERY') { open('reset'); }
        setTimeout(refresh, 0);
      });
      await refresh();
    } catch (e) { client = null; }
    resolveReady();
  }

  /* ---------------- Modal ---------------- */
  var overlay, box, opener, mode = 'login';
  function build() {
    overlay = document.createElement('div'); overlay.className = 'lc-modal'; overlay.hidden = true;
    overlay.innerHTML = '<div class="lc-modal-box" role="dialog" aria-modal="true" aria-labelledby="lc-auth-title"><button type="button" class="lc-modal-x" aria-label="Close">&times;</button><div id="lc-auth-body"></div></div>';
    document.body.appendChild(overlay);
    box = overlay.querySelector('.lc-modal-box');
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    box.querySelector('.lc-modal-x').addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (overlay.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var f = box.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea'); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  function close() { if (!overlay) return; overlay.hidden = true; document.body.style.overflow = ''; if (opener && opener.focus) opener.focus(); }
  function field(id, label, type, extra) {
    return '<div class="lc-f"><label for="' + id + '">' + label + '</label><input id="' + id + '" type="' + type + '" ' + (extra || '') + '><span class="lc-ferr" id="' + id + '-err" hidden role="alert"></span></div>';
  }
  function msg(text, kind) { var m = document.getElementById('lc-auth-msg'); if (!m) return; m.textContent = text || ''; m.className = 'lc-msg ' + (kind || ''); m.hidden = !text; }
  function setErr(id, text) { var e = document.getElementById(id + '-err'), i = document.getElementById(id); if (!e) return; e.textContent = text || ''; e.hidden = !text; if (i) { if (text) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid'); } }
  function render() {
    var b = document.getElementById('lc-auth-body'), h = '';
    if (!configured || (!client && !user)) {
      if (!configured) {
        h = '<h2 id="lc-auth-title">Login is coming soon</h2><p class="lc-p">Customer login is being set up. Until then you can reach us on WhatsApp or Instagram for orders and enquiries.</p><a class="lc-btn" href="' + LC.wa('Hi Lupin Craftings') + '" target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>';
      } else {
        h = '<h2 id="lc-auth-title">Login is not available right now</h2><p class="lc-p">We could not reach the login service. Please check your internet and try again.</p>';
      }
    } else if (user && mode !== 'reset') {
      h = '<h2 id="lc-auth-title">Your account</h2><dl class="lc-dl"><dt>Name</dt><dd>' + esc((profile && profile.name) || '') + '</dd><dt>Email</dt><dd>' + esc(user.email || '') + '</dd><dt>Phone</dt><dd>' + esc((profile && profile.phone) || '') + '</dd></dl>' +
        (admin ? '<a class="lc-btn" href="admin.html">Open admin page</a>' : '') + '<button type="button" class="lc-btn lc-btn-o" id="lc-logout">Log out</button>';
    } else if (mode === 'reset') {
      h = '<h2 id="lc-auth-title">Set a new password</h2><form id="lc-form" novalidate>' + field('lc-pw', 'New password (8 or more characters)', 'password', 'autocomplete="new-password" minlength="8"') + '<p id="lc-auth-msg" class="lc-msg" hidden role="status"></p><button class="lc-btn" type="submit">Save password</button></form>';
    } else {
      h = '<h2 id="lc-auth-title">' + (mode === 'signup' ? 'Create your account' : 'Log in') + '</h2>' +
        '<div class="lc-tabs" role="tablist"><button type="button" role="tab" aria-selected="' + (mode === 'login') + '" data-mode="login">Log in</button><button type="button" role="tab" aria-selected="' + (mode === 'signup') + '" data-mode="signup">Sign up</button></div>' +
        '<form id="lc-form" novalidate>' +
        (mode === 'signup' ? field('lc-su-name', 'Full name <span class="lc-req">*</span>', 'text', 'autocomplete="name"') : '') +
        field('lc-em', 'Email <span class="lc-req">*</span>', 'email', 'autocomplete="email"') +
        (mode === 'signup' ? field('lc-ph', 'Phone number <span class="lc-req">*</span>', 'tel', 'autocomplete="tel"') : '') +
        field('lc-pw', 'Password' + (mode === 'signup' ? ' (8 or more characters)' : '') + ' <span class="lc-req">*</span>', 'password', 'autocomplete="' + (mode === 'signup' ? 'new-password' : 'current-password') + '"') +
        (mode === 'signup' ? '<label class="lc-check"><input type="checkbox" id="lc-consent"> <span>I agree that Lupin Craftings stores my name, email and phone number to manage my account, orders and reviews.</span></label><span class="lc-ferr" id="lc-consent-err" hidden role="alert"></span>' : '') +
        '<p id="lc-auth-msg" class="lc-msg" hidden role="status"></p>' +
        '<button class="lc-btn" type="submit">' + (mode === 'signup' ? 'Create account' : 'Log in') + '</button>' +
        (mode === 'login' ? '<button type="button" class="lc-link" id="lc-forgot">Forgot password?</button>' : '') + '</form>';
    }
    b.innerHTML = h;
    var first = b.querySelector('input,button.lc-btn,a.lc-btn'); if (first) first.focus();
  }
  function open(m) {
    if (!overlay) build();
    opener = document.activeElement; mode = m || 'login';
    if (user && mode !== 'reset') mode = 'account';
    render(); overlay.hidden = false; document.body.style.overflow = 'hidden';
  }
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }
  function friendly(m) {
    if (/invalid login/i.test(m)) return 'Wrong email or password.';
    if (/not confirmed/i.test(m)) return 'Please confirm your email first. Check your inbox (and spam folder).';
    if (/rate limit|too many/i.test(m)) return 'Too many tries. Please wait a few minutes and try again.';
    return m;
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-mode]');
    if (t && overlay && !overlay.hidden) { mode = t.getAttribute('data-mode'); render(); return; }
    if (e.target.closest('#lc-login-btn')) { open('login'); return; }
    if (e.target.id === 'lc-logout') { client.auth.signOut().then(function () { close(); LC.toast('Logged out'); }); return; }
    if (e.target.id === 'lc-forgot') {
      var em = val('lc-em');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { setErr('lc-em', 'Enter your email first, then press Forgot password.'); return; }
      client.auth.resetPasswordForEmail(em, { redirectTo: location.origin + location.pathname }).then(function (r) {
        msg(r.error ? friendly(r.error.message) : 'We have emailed you a link to set a new password.', r.error ? 'err' : 'ok');
      });
    }
  });
  document.addEventListener('submit', async function (e) {
    if (e.target.id !== 'lc-form') return;
    e.preventDefault(); msg('');
    var btn = e.target.querySelector('button[type=submit]');
    if (mode === 'reset') {
      var np = val('lc-pw'); setErr('lc-pw', np.length < 8 ? 'Use 8 or more characters.' : ''); if (np.length < 8) return;
      btn.disabled = true; var r0 = await client.auth.updateUser({ password: np }); btn.disabled = false;
      if (r0.error) msg(friendly(r0.error.message), 'err'); else { LC.toast('Password updated'); mode = 'account'; render(); }
      return;
    }
    var em = val('lc-em'), pw = document.getElementById('lc-pw').value, bad = false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { setErr('lc-em', 'Please enter a valid email address.'); bad = true; } else setErr('lc-em', '');
    if (pw.length < (mode === 'signup' ? 8 : 1)) { setErr('lc-pw', mode === 'signup' ? 'Use 8 or more characters.' : 'Please enter your password.'); bad = true; } else setErr('lc-pw', '');
    var name = '', phone = '';
    if (mode === 'signup') {
      name = val('lc-su-name'); phone = val('lc-ph');
      if (name.length < 2) { setErr('lc-su-name', 'Please enter your name.'); bad = true; } else setErr('lc-su-name', '');
      var d = phone.replace(/\D/g, ''); if (d.length < 10 || d.length > 15) { setErr('lc-ph', 'Please enter a valid phone number.'); bad = true; } else setErr('lc-ph', '');
      var ce = document.getElementById('lc-consent-err');
      if (!document.getElementById('lc-consent').checked) { ce.textContent = 'Please tick the box to continue.'; ce.hidden = false; bad = true; } else ce.hidden = true;
    }
    if (bad) return;
    btn.disabled = true;
    if (mode === 'signup') {
      var r = await client.auth.signUp({ email: em, password: pw, options: { data: { name: name, phone: phone }, emailRedirectTo: location.origin + location.pathname } });
      btn.disabled = false;
      if (r.error) { msg(friendly(r.error.message), 'err'); return; }
      if (r.data.user && r.data.user.identities && r.data.user.identities.length === 0) { msg('This email already has an account. Please log in.', 'err'); return; }
      if (r.data.session) { close(); LC.toast('Welcome, ' + name.split(' ')[0] + '!'); }
      else msg('Account created. We emailed you a link. Please confirm your email, then log in.', 'ok');
    } else {
      var r2 = await client.auth.signInWithPassword({ email: em, password: pw });
      btn.disabled = false;
      if (r2.error) { msg(friendly(r2.error.message), 'err'); return; }
      close(); LC.toast('Logged in');
    }
  });

  window.LCAuth = {
    ready: ready, configured: configured, open: open,
    client: function () { return client; }, user: function () { return user; }, profile: function () { return profile; }, isAdmin: function () { return admin; },
    onChange: function (f) { subs.push(f); },
    saveEnquiry: function (row) { if (client) { client.from('enquiries').insert(row).then(function () {}); } }
  };
  init();
})();
