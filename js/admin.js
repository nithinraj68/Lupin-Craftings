/* Admin page: approve reviews, see customers and enquiries. Access is enforced by the database (see supabase-setup.sql). */
(function () {
  var LC = window.LC, esc = LC.esc, A = window.LCAuth, root = document.getElementById('ad-root');
  var tab = 'pending';
  function box(html) { root.innerHTML = html; }
  function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += '<span style="color:' + (i <= n ? LC.GOLD : '#D8D5CE') + '">★</span>'; return s; }
  function csv(rows, cols) {
    var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
    return [cols.map(function (c) { return q(c[1]); }).join(',')].concat(rows.map(function (r) { return cols.map(function (c) { return q(r[c[0]]); }).join(','); })).join('\n');
  }
  function download(name, text) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv' })); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  function fmt(d) { return d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''; }
  var cache = {};

  async function render() {
    var c = A.client();
    var tabs = [['pending', 'Reviews to approve'], ['published', 'Published reviews'], ['users', 'Customers'], ['enquiries', 'Enquiries']];
    var h = '<div class="lc-tabs" role="tablist" style="max-width:720px">' + tabs.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div id="ad-body" aria-live="polite">Loading…</div>';
    box(h);
    var body = document.getElementById('ad-body'), out = '', r;
    if (tab === 'pending' || tab === 'published') {
      r = await c.from('reviews').select('*').eq('approved', tab === 'published').order('created_at', { ascending: false });
      cache.reviews = r.data || [];
      out = cache.reviews.length ? '<div class="rv-list">' + cache.reviews.map(function (x) {
        var ph = (x.photos || []).map(function (u) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer"><img src="' + esc(u) + '" alt="Review photo" loading="lazy"></a>'; }).join('');
        return '<article class="rv-card"><div class="rv-top"><span style="font-size:18px">' + stars(x.rating) + '</span><span class="rv-date">' + esc(fmt(x.created_at)) + '</span></div><p class="rv-text">' + esc(x.text) + '</p>' + (ph ? '<div class="rv-photos">' + ph + '</div>' : '') +
          '<div class="rv-by"><strong>' + esc(x.name) + '</strong> · ' + esc(x.product || '') + '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' + (tab === 'pending' ? '<button class="lc-btn" style="width:auto;margin:0" data-approve="' + x.id + '">Approve and publish</button>' : '<button class="lc-btn lc-btn-o" style="width:auto;margin:0" data-unpub="' + x.id + '">Unpublish</button>') +
          '<button class="lc-btn lc-btn-o" style="width:auto;margin:0;border-color:#9B2C1F;color:#9B2C1F" data-del="' + x.id + '">Delete</button></div></article>';
      }).join('') + '</div>' : '<p class="rv-empty">' + (tab === 'pending' ? 'No reviews waiting for approval.' : 'No published reviews yet.') + '</p>';
    } else {
      var cols = tab === 'users' ? [['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['created_at', 'Joined']] : [['created_at', 'Date'], ['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'], ['interest', 'Interested in'], ['vehicle', 'Vehicle'], ['message', 'Message'], ['channel', 'Sent via']];
      r = await c.from(tab === 'users' ? 'profiles' : 'enquiries').select('*').order('created_at', { ascending: false }).limit(2000);
      var rows = r.data || []; cache.rows = rows; cache.cols = cols;
      out = '<p><button class="lc-btn" style="width:auto" data-csv="' + tab + '">Download as Excel / CSV file</button></p>' +
        (rows.length ? '<div style="overflow-x:auto"><table class="ad-table"><thead><tr>' + cols.map(function (x) { return '<th>' + x[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
          rows.map(function (row) { return '<tr>' + cols.map(function (x) { return '<td>' + esc(x[0] === 'created_at' ? fmt(row[x[0]]) : (row[x[0]] == null ? '' : row[x[0]])) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' : '<p class="rv-empty">Nothing here yet.</p>');
    }
    if (r && r.error) out = '<p class="lc-msg err">Could not load: ' + esc(r.error.message) + '</p>';
    body.innerHTML = out;
  }

  root.addEventListener('click', async function (e) {
    var c = A.client(), t;
    if ((t = e.target.closest('[data-tab]'))) { tab = t.getAttribute('data-tab'); render(); return; }
    if ((t = e.target.closest('[data-approve]'))) { t.disabled = true; var r = await c.from('reviews').update({ approved: true }).eq('id', t.getAttribute('data-approve')); if (r.error) LC.toast('Error: ' + r.error.message); else { LC.toast('Published'); render(); } return; }
    if ((t = e.target.closest('[data-unpub]'))) { var r2 = await c.from('reviews').update({ approved: false }).eq('id', t.getAttribute('data-unpub')); if (r2.error) LC.toast('Error: ' + r2.error.message); else { LC.toast('Unpublished'); render(); } return; }
    if ((t = e.target.closest('[data-del]'))) {
      if (!t.hasAttribute('data-sure')) { t.setAttribute('data-sure', '1'); t.textContent = 'Click again to delete'; return; }
      var id = t.getAttribute('data-del'), rv = (cache.reviews || []).filter(function (x) { return x.id === id; })[0];
      if (rv && rv.photos && rv.photos.length) {
        var paths = rv.photos.map(function (u) { var i = u.indexOf('/review-photos/'); return i > -1 ? decodeURIComponent(u.slice(i + 15)) : null; }).filter(Boolean);
        if (paths.length) await c.storage.from('review-photos').remove(paths);
      }
      var r3 = await c.from('reviews').delete().eq('id', id); if (r3.error) LC.toast('Error: ' + r3.error.message); else { LC.toast('Deleted'); render(); } return;
    }
    if ((t = e.target.closest('[data-csv]'))) { download('lupin-' + t.getAttribute('data-csv') + '.csv', csv(cache.rows, cache.cols)); }
  });

  function gate() {
    if (!A.configured) { box('<p class="lc-p">The backend is not set up yet. Follow SETUP-BACKEND.md first.</p>'); return; }
    if (!A.client()) { box('<p class="lc-p">Could not reach the service. Please try again.</p>'); return; }
    if (!A.user()) { box('<p class="lc-p">Please log in with your admin account.</p><button type="button" class="lc-btn" style="width:auto" id="ad-login">Log in</button>'); return; }
    if (!A.isAdmin()) { box('<p class="lc-msg err">This account is not an admin account. Add the email to the admins table (see SETUP-BACKEND.md).</p>'); return; }
    render();
  }
  root.addEventListener('click', function (e) { if (e.target.id === 'ad-login') A.open('login'); });
  var last = 'x';
  A.ready.then(function () { last = (A.user() && A.user().id) + ':' + A.isAdmin(); gate(); });
  A.onChange(function () { var k = (A.user() && A.user().id) + ':' + A.isAdmin(); if (k !== last) { last = k; gate(); } });
})();
