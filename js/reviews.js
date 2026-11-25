/* Customer reviews: shows approved reviews, and lets logged-in customers submit one (with photos) for approval. */
(function () {
  var LC = window.LC, esc = LC.esc, A = window.LCAuth;
  var PRODUCTS = ['Car cover', 'Tyredox tyre cushions', 'Metal wall art', 'Custom metal wall art', 'Tabletop piece', 'Microfiber cloths', 'Other'];
  var $ = function (id) { return document.getElementById(id); };
  var list = $('rv-list'), homeList = $('rv-home-list'), formWrap = $('rv-form-wrap');
  if (!list && !homeList) return;

  function stars(n, size) {
    var s = '<span class="rv-stars" role="img" aria-label="' + n + ' out of 5 stars" style="font-size:' + (size || 18) + 'px">';
    for (var i = 1; i <= 5; i++) s += '<span style="color:' + (i <= n ? LC.GOLD : '#D8D5CE') + '" aria-hidden="true">★</span>';
    return s + '</span>';
  }
  function card(r) {
    var photos = (r.photos || []).map(function (u) { return '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer"><img src="' + esc(u) + '" alt="Photo from ' + esc(r.name) + '" loading="lazy"></a>'; }).join('');
    var d = r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    return '<article class="rv-card"><div class="rv-top">' + stars(r.rating) + '<span class="rv-date">' + esc(d) + '</span></div>' +
      '<p class="rv-text">' + esc(r.text) + '</p>' + (photos ? '<div class="rv-photos">' + photos + '</div>' : '') +
      '<div class="rv-by"><strong>' + esc(r.name) + '</strong>' + (r.product ? '<span> · ' + esc(r.product) + '</span>' : '') + '</div></article>';
  }

  async function loadReviews() {
    var c = A.client();
    if (!A.configured || !c) {
      if (list) list.innerHTML = '<p class="rv-empty">Customer reviews will appear here soon.</p>';
      return;
    }
    var r = await c.from('reviews').select('id,name,product,rating,text,photos,created_at').eq('approved', true).order('created_at', { ascending: false }).limit(60);
    var rows = r.data || [];
    if (list) {
      list.innerHTML = rows.length ? rows.map(card).join('') : '<p class="rv-empty">No reviews yet. Be the first to share yours.</p>';
      var sum = $('rv-summary');
      if (sum && rows.length) {
        var avg = rows.reduce(function (n, x) { return n + x.rating; }, 0) / rows.length;
        sum.innerHTML = stars(Math.round(avg), 22) + ' <strong>' + avg.toFixed(1) + '</strong> out of 5 · ' + rows.length + (rows.length === 1 ? ' review' : ' reviews');
      }
    }
    var home = $('rv-home');
    if (home && rows.length) { homeList.innerHTML = rows.slice(0, 3).map(card).join(''); home.hidden = false; }
  }

  /* ---- write a review ---- */
  var rating = 0, files = [];
  function formHTML() {
    var u = A.user();
    if (!A.configured) return '<h2 class="rv-h">Write a review</h2><p class="lc-p">Reviews are being set up and will open soon.</p>';
    if (!A.client()) return '<h2 class="rv-h">Write a review</h2><p class="lc-p">We could not reach the review service. Please try again later.</p>';
    if (!u) return '<h2 class="rv-h">Write a review</h2><p class="lc-p">Please log in or create a free account to write a review.</p><button type="button" class="lc-btn" id="rv-login">Log in or sign up</button>';
    var opts = PRODUCTS.map(function (p) { return '<option value="' + esc(p) + '">' + esc(p) + '</option>'; }).join('');
    return '<h2 class="rv-h">Write a review</h2><form id="rv-form" novalidate>' +
      '<div class="lc-f"><label for="rv-product">Product you bought</label><select id="rv-product">' + opts + '</select></div>' +
      '<div class="lc-f"><span id="rv-rate-label" style="font-size:14px;font-weight:600">Your rating <span class="lc-req">*</span></span><div id="rv-rate" role="radiogroup" aria-labelledby="rv-rate-label" class="rv-rate"></div><span class="lc-ferr" id="rv-rate-err" hidden role="alert"></span></div>' +
      '<div class="lc-f"><label for="rv-text">Your review <span class="lc-req">*</span></label><textarea id="rv-text" rows="5" maxlength="1000" placeholder="Tell us what you bought and how it looks or works."></textarea><span class="lc-ferr" id="rv-text-err" hidden role="alert"></span></div>' +
      '<div class="lc-f"><label for="rv-photos">Photos of your product (optional, up to 3)</label><input id="rv-photos" type="file" accept="image/*" multiple><div id="rv-previews" class="rv-photos"></div><span class="lc-ferr" id="rv-photos-err" hidden role="alert"></span></div>' +
      '<p id="rv-msg" class="lc-msg" hidden role="status"></p>' +
      '<button type="submit" class="lc-btn" id="rv-submit">Submit review</button>' +
      '<p class="lc-p" style="margin:10px 0 0;font-size:13px">Your review is shown after we approve it. Only your first name and last initial are shown.</p></form>';
  }
  function drawRate() {
    var r = $('rv-rate'); if (!r) return;
    var h = '';
    for (var i = 1; i <= 5; i++) h += '<button type="button" role="radio" aria-checked="' + (rating === i) + '" aria-label="' + i + (i === 1 ? ' star' : ' stars') + '" data-star="' + i + '" style="color:' + (i <= rating ? LC.GOLD : '#C9C5BC') + '">★</button>';
    r.innerHTML = h;
  }
  function setErr(id, t) { var e = $(id); if (!e) return; e.textContent = t || ''; e.hidden = !t; }
  function showMsg(t, k) { var m = $('rv-msg'); m.textContent = t; m.className = 'lc-msg ' + (k || ''); m.hidden = !t; }
  function drawPreviews() {
    var p = $('rv-previews'); if (!p) return;
    p.innerHTML = '';
    files.forEach(function (f, i) {
      var url = URL.createObjectURL(f);
      var d = document.createElement('div'); d.className = 'rv-prev';
      d.innerHTML = '<img src="' + url + '" alt="Selected photo ' + (i + 1) + '"><button type="button" data-rmphoto="' + i + '" aria-label="Remove photo ' + (i + 1) + '">&times;</button>';
      p.appendChild(d);
    });
  }
  function compress(file) {      // shrink big phone photos to about 1280 px before uploading
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var m = 1280, w = img.width, h = img.height, k = Math.min(1, m / Math.max(w, h));
        var cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob(function (b) { URL.revokeObjectURL(url); b ? res(b) : rej(new Error('image')); }, 'image/jpeg', 0.82);
      };
      img.onerror = function () { rej(new Error('image')); }; img.src = url;
    });
  }
  function shortName() {
    var p = A.profile(), u = A.user();
    var n = ((p && p.name) || (u.user_metadata && u.user_metadata.name) || (u.email || '').split('@')[0] || 'Customer').trim().split(/\s+/);
    return n.length > 1 ? n[0] + ' ' + n[n.length - 1].charAt(0).toUpperCase() + '.' : n[0];
  }
  function renderForm() {
    if (!formWrap) return;
    formWrap.innerHTML = formHTML(); rating = 0; files = []; drawRate();
  }
  if (formWrap) {
    formWrap.addEventListener('click', function (e) {
      if (e.target.id === 'rv-login') A.open('login');
      var s = e.target.closest('[data-star]'); if (s) { rating = +s.getAttribute('data-star'); setErr('rv-rate-err', ''); drawRate(); }
      var x = e.target.closest('[data-rmphoto]'); if (x) { files.splice(+x.getAttribute('data-rmphoto'), 1); drawPreviews(); }
    });
    formWrap.addEventListener('change', function (e) {
      if (e.target.id !== 'rv-photos') return;
      setErr('rv-photos-err', '');
      var picked = Array.prototype.slice.call(e.target.files), bad = '';
      picked.forEach(function (f) {
        if (!/^image\//.test(f.type)) bad = 'Please choose image files only.';
        else if (f.size > 15 * 1024 * 1024) bad = 'Each photo must be under 15 MB.';
        else if (files.length < 3) files.push(f); else bad = 'You can add up to 3 photos.';
      });
      if (bad) setErr('rv-photos-err', bad);
      e.target.value = ''; drawPreviews();
    });
    formWrap.addEventListener('submit', async function (e) {
      if (e.target.id !== 'rv-form') return;
      e.preventDefault(); showMsg('');
      var text = $('rv-text').value.trim(), bad = false;
      if (!rating) { setErr('rv-rate-err', 'Please choose a star rating.'); bad = true; }
      if (text.length < 10) { setErr('rv-text-err', 'Please write at least 10 characters.'); bad = true; } else setErr('rv-text-err', '');
      if (bad) return;
      var btn = $('rv-submit'); btn.disabled = true; btn.textContent = 'Sending…';
      try {
        var c = A.client(), u = A.user(), urls = [];
        for (var i = 0; i < files.length; i++) {
          var blob = await compress(files[i]);
          var path = u.id + '/' + Date.now() + '-' + i + '.jpg';
          var up = await c.storage.from('review-photos').upload(path, blob, { contentType: 'image/jpeg' });
          if (up.error) throw up.error;
          urls.push(c.storage.from('review-photos').getPublicUrl(path).data.publicUrl);
        }
        var ins = await c.from('reviews').insert({ user_id: u.id, name: shortName(), product: $('rv-product').value, rating: rating, text: text, photos: urls, approved: false });
        if (ins.error) throw ins.error;
        formWrap.innerHTML = '<h2 class="rv-h">Thank you!</h2><p class="lc-p">Your review has been received. It will appear on this page after we approve it.</p><button type="button" class="lc-btn lc-btn-o" id="rv-again">Write another review</button>';
        $('rv-again').addEventListener('click', renderForm);
      } catch (err) {
        btn.disabled = false; btn.textContent = 'Submit review';
        showMsg('Sorry, we could not send your review. Please try again. (' + (err && err.message ? err.message : 'error') + ')', 'err');
      }
    });
  }
  var lastId;
  A.ready.then(function () { lastId = A.user() ? A.user().id : null; renderForm(); loadReviews(); });
  A.onChange(function () {
    var id = A.user() ? A.user().id : null;
    if (id !== lastId) { lastId = id; renderForm(); }   // only redraw when someone logs in or out
  });
})();
