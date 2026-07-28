/* course-site runtime. Self-contained, no dependencies, no network.
   Copy verbatim; customize through #course-config, not by editing this file. */
(function () {
  'use strict';

  var html = document.documentElement;
  html.classList.remove('no-js');

  function json(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    try { return JSON.parse(el.textContent); }
    catch (e) { console.warn('bad JSON in #' + id, e); return null; }
  }
  var CFG = json('course-config') || { slug: 'course', passingScore: 70, units: [], totalTopics: 0 };
  var KEY = 'course:' + CFG.slug + ':v1';
  var VERSION = 1;

  /* ---------------- store ---------------- */
  var Store = (function () {
    var mem = null, ok = false, warned = false, timer = null;
    try {
      var probe = '__cs__';
      localStorage.setItem(probe, '1'); localStorage.removeItem(probe);
      ok = true;
    } catch (e) { ok = false; }

    function blank() { return { v: VERSION, name: null, theme: 'system', lastVisited: null,
                                topics: {}, tests: {}, projects: {} }; }

    function load() {
      if (mem) return mem;
      if (!ok) { mem = blank(); return mem; }
      var raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
      if (!raw) { mem = blank(); return mem; }
      var data;
      try { data = JSON.parse(raw); } catch (e) { data = null; }
      if (!data || typeof data !== 'object' || data.v !== VERSION) {
        try { localStorage.removeItem(KEY); } catch (e) {}
        notice('Saved progress was from an older version and has been reset.');
        mem = blank(); return mem;
      }
      // defensive: guarantee shape
      ['topics', 'tests', 'projects'].forEach(function (k) {
        if (!data[k] || typeof data[k] !== 'object' || Array.isArray(data[k])) data[k] = {};
      });
      mem = data; return mem;
    }

    function persist() {
      if (!ok) return;
      var d = load();
      try { localStorage.setItem(KEY, JSON.stringify(d)); return; }
      catch (e) {
        // quota: shed the least important data, in order, then give up loudly-but-once.
        try {
          Object.keys(d.topics).forEach(function (k) { if (d.topics[k].quiz) delete d.topics[k].quiz.missed; });
          Object.keys(d.tests).forEach(function (k) { delete d.tests[k].missed; });
          localStorage.setItem(KEY, JSON.stringify(d)); return;
        } catch (e2) {}
        try { d.projects = {}; localStorage.setItem(KEY, JSON.stringify(d)); return; } catch (e3) {}
        notice('Storage is full — recent progress may not be saved.');
      }
    }

    function save() { clearTimeout(timer); timer = setTimeout(persist, 250); }

    // Built node-by-node, not via innerHTML: this can fire before the body is parsed.
    function notice(msg) {
      if (warned) return; warned = true;
      function mount() {
        if (!document.body) return;
        var b = document.createElement('div');
        b.className = 'banner'; b.setAttribute('role', 'status');
        var wrap = document.createElement('div'); wrap.className = 'wrap';
        var span = document.createElement('span'); span.textContent = msg;
        var btn = document.createElement('button');
        btn.className = 'btn btn--quiet'; btn.type = 'button';
        btn.style.marginLeft = 'auto'; btn.textContent = 'Dismiss';
        btn.addEventListener('click', function () { b.remove(); });
        wrap.appendChild(span); wrap.appendChild(btn); b.appendChild(wrap);
        document.body.insertBefore(b, document.body.firstChild);
      }
      if (document.body) mount();
      else document.addEventListener('DOMContentLoaded', mount);
    }

    if (!ok) notice("Progress won't be saved — this browser has storage disabled.");

    window.addEventListener('storage', function (e) {
      if (e.key === KEY) { mem = null; render(); }
    });

    return {
      get: load, save: save, available: ok,
      reset: function () {
        mem = blank();
        if (ok) { try { localStorage.removeItem(KEY); } catch (e) {} }
      }
    };
  })();

  /* ---------------- derived ---------------- */
  function topicsDone() {
    var t = Store.get().topics, n = 0;
    for (var k in t) if (t[k] && t[k].read) n++;
    return n;
  }
  function avg(list) {
    if (!list.length) return null;
    var s = 0; list.forEach(function (x) { s += x; });
    return Math.round((s / list.length) * 100);
  }
  function testScores() {
    var t = Store.get().tests, out = [];
    for (var k in t) if (t[k] && t[k].total) out.push(t[k].score / t[k].total);
    return out;
  }
  function quizScores() {
    var t = Store.get().topics, out = [];
    for (var k in t) if (t[k] && t[k].quiz && t[k].quiz.total) out.push(t[k].quiz.score / t[k].quiz.total);
    return out;
  }

  /* ---------------- theme ---------------- */
  function initTheme() {
    var pref = Store.get().theme || 'system';
    apply(pref);
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var cur = Store.get().theme || 'system';
      var next = cur === 'dark' ? 'light' : cur === 'light' ? 'system' : 'dark';
      Store.get().theme = next; Store.save(); apply(next);
    });
    function apply(v) {
      if (v === 'system') html.removeAttribute('data-theme');
      else html.setAttribute('data-theme', v);
      if (btn) {
        btn.setAttribute('aria-label', 'Theme: ' + v + '. Click to change.');
        btn.textContent = v === 'dark' ? '◑' : v === 'light' ? '○' : '◒';
      }
    }
  }

  /* ---------------- progress rendering ---------------- */
  function render() {
    var done = topicsDone(), total = CFG.totalTopics || 1;
    var pct = Math.round((done / total) * 100);

    document.querySelectorAll('[data-ring]').forEach(function (el) {
      var v = el.querySelector('.value'), lbl = el.querySelector('.ring__label');
      if (v) {
        var r = v.r.baseVal.value, c = 2 * Math.PI * r;
        v.style.strokeDasharray = c;
        v.style.strokeDashoffset = c * (1 - pct / 100);
      }
      if (lbl) lbl.textContent = pct + '%';
    });

    document.querySelectorAll('[data-stat]').forEach(function (el) {
      var k = el.getAttribute('data-stat'), qa = avg(quizScores()), ta = avg(testScores());
      el.textContent =
        k === 'topics' ? done + ' / ' + total :
        k === 'quizzes' ? String(quizScores().length) :
        k === 'quiz-avg' ? (qa === null ? '—' : qa + '%') :
        k === 'test-avg' ? (ta === null ? '—' : ta + '%') : el.textContent;
    });

    var st = Store.get();
    document.querySelectorAll('[data-topic-state]').forEach(function (el) {
      var id = el.getAttribute('data-topic-state'), rec = st.topics[id];
      var dot = el.querySelector('.dot'), score = el.querySelector('.score');
      if (dot) {
        dot.className = 'dot' + (rec && rec.quiz ? ' dot--quizzed' : rec && rec.read ? ' dot--read' : '');
      }
      if (score) score.textContent = rec && rec.quiz ? rec.quiz.score + '/' + rec.quiz.total : '';
    });

    document.querySelectorAll('[data-unit-bar]').forEach(function (el) {
      var id = el.getAttribute('data-unit-bar');
      var unit = (CFG.units || []).filter(function (u) { return u.id === id; })[0];
      if (!unit) return;
      var n = unit.topics.filter(function (t) { return st.topics[t] && st.topics[t].read; }).length;
      var span = el.querySelector('span');
      if (span) span.style.width = Math.round((n / (unit.topics.length || 1)) * 100) + '%';
    });

    var resume = document.querySelector('[data-resume]');
    if (resume) {
      if (st.lastVisited) { resume.hidden = false; resume.querySelector('a').setAttribute('href', st.lastVisited); }
      else resume.hidden = true;
    }
  }

  /* ---------------- reading ---------------- */
  function initReading() {
    var btn = document.querySelector('[data-mark-read]');
    if (!btn) return;
    var id = btn.getAttribute('data-mark-read');
    var st = Store.get();
    st.topics[id] = st.topics[id] || {};
    sync();
    btn.addEventListener('click', function () {
      var rec = Store.get().topics[id];
      rec.read = !rec.read;
      if (rec.read) rec.readAt = Date.now();
      Store.save(); sync(); render();
    });
    function sync() {
      var read = !!Store.get().topics[id].read;
      btn.textContent = read ? '✓ Marked as read' : 'Mark as read';
      btn.classList.toggle('btn--primary', !read);
      btn.setAttribute('aria-pressed', String(read));
    }
  }

  function trackVisit() {
    var p = document.body.getAttribute('data-page-path');
    if (!p) return;
    Store.get().lastVisited = p; Store.save();
  }

  /* ---------------- quiz ---------------- */
  function initQuiz() {
    var root = document.querySelector('[data-quiz]');
    var data = json('quiz-data');
    if (!root || !data) return;

    var qs = data.questions || [];
    var state = qs.map(function () { return { done: false, correct: false }; });
    var stored = data.kind === 'test' ? Store.get().tests[data.id] : (Store.get().topics[data.id] || {}).quiz;

    root.querySelectorAll('.q').forEach(function (qEl, i) {
      var q = qs[i]; if (!q) return;
      var check = qEl.querySelector('[data-check]');
      var explain = qEl.querySelector('.explain');
      var self = qEl.querySelector('.self-grade');
      if (explain) explain.hidden = true;
      if (self) self.hidden = true;

      if (check) check.addEventListener('click', function () {
        if (state[i].done) return;
        if (q.type === 'SHORT_ANSWER') {
          reveal(qEl, explain, null);
          if (self) self.hidden = false;
          check.disabled = true;
          return;
        }
        var chosen = qEl.querySelector('input:checked');
        if (!chosen) { qEl.querySelector('fieldset').setAttribute('data-nudge', '1'); return; }
        var idx = Number(chosen.value);
        var right = q.type === 'TRUE_FALSE'
          ? (idx === 1) === (q.correctAnswer === true)
          : idx === q.correctOptionIndex;
        mark(qEl, q, idx, right);
        reveal(qEl, explain, right);
        resolve(i, right, q);
        check.disabled = true;
      });

      if (self) self.querySelectorAll('[data-self]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (state[i].done) return;
          var right = b.getAttribute('data-self') === 'got';
          self.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
          b.classList.add('btn--primary');
          resolve(i, right, q);
        });
      });
    });

    function mark(qEl, q, idx, right) {
      qEl.setAttribute('data-locked', '1');
      qEl.querySelectorAll('.opt').forEach(function (o, oi) {
        var correctIdx = q.type === 'TRUE_FALSE' ? (q.correctAnswer === true ? 1 : 0) : q.correctOptionIndex;
        o.querySelector('input').disabled = true;
        if (oi === correctIdx) o.classList.add('opt--correct');
        else if (oi === idx && !right) o.classList.add('opt--chosen-wrong');
      });
    }

    function reveal(qEl, explain, right) {
      if (!explain) return;
      explain.hidden = false;
      if (right !== null) explain.setAttribute('data-state', right ? 'ok' : 'bad');
      var det = qEl.querySelector('details'); if (det) det.remove(); // no-JS fallback no longer needed
    }

    function resolve(i, right, q) {
      state[i] = { done: true, correct: right, objectives: q.objectives || [] };
      announce((right ? 'Correct. ' : 'Incorrect. ') + remaining() + ' remaining.');
      if (state.every(function (s) { return s.done; })) finish();
    }
    function remaining() { return state.filter(function (s) { return !s.done; }).length; }

    function finish() {
      var score = state.filter(function (s) { return s.correct; }).length;
      var total = state.length;
      var missed = [];
      state.forEach(function (s) {
        if (!s.correct) (s.objectives || []).forEach(function (o) { if (missed.indexOf(o) < 0) missed.push(o); });
      });
      var rec = { score: score, total: total, at: Date.now(), missed: missed };
      var st = Store.get();
      if (data.kind === 'test') st.tests[data.id] = rec;
      else { st.topics[data.id] = st.topics[data.id] || {}; st.topics[data.id].quiz = rec; }
      Store.save(); render();

      var pct = Math.round((score / total) * 100);
      var passed = pct >= (CFG.passingScore || 70);
      showResult(pct, score, total, missed, passed);
      if (!stored) { if (passed) celebrate(); }
      stored = rec;
    }

    function showResult(pct, score, total, missed, passed) {
      var box = root.querySelector('.quiz__result');
      if (!box) return;
      box.hidden = false;
      box.innerHTML = '';
      var h = document.createElement('p');
      h.className = 'quiz__score badge-pop';
      h.textContent = score + ' / ' + total + '  (' + pct + '%)';
      var msg = document.createElement('p');
      msg.textContent = passed ? 'Passed — nice work.' : "Below the pass mark — here's what to review.";
      box.appendChild(h); box.appendChild(msg);
      if (missed.length) {
        var ul = document.createElement('ul'); ul.className = 'review';
        missed.forEach(function (o) {
          var li = document.createElement('li');
          var name = (data.objectiveNames || {})[o];
          li.textContent = name ? 'Objective ' + o + ' — ' + name : 'Objective ' + o;
          ul.appendChild(li);
        });
        box.appendChild(ul);
      }
      var again = document.createElement('button');
      again.className = 'btn'; again.textContent = 'Retake';
      again.addEventListener('click', function () {
        var st = Store.get();
        if (data.kind === 'test') delete st.tests[data.id];
        else if (st.topics[data.id]) delete st.topics[data.id].quiz;
        Store.save(); location.reload();
      });
      box.appendChild(again);
      box.scrollIntoView({ block: 'nearest' });
    }
  }

  function announce(msg) {
    var live = document.querySelector('[data-live]');
    if (live) live.textContent = msg;
  }

  /* ---------------- celebration ---------------- */
  function celebrate() {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas');
    c.id = 'confetti'; c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    var ctx = c.getContext('2d');
    var w = c.width = innerWidth, h = c.height = innerHeight;
    var accent = getComputedStyle(html).getPropertyValue('--accent').trim() || '#3f7ac4';
    var colors = [accent, '#f5c451', '#4fbf87', '#e8734a', '#8d7ce0'];
    var bits = [];
    for (var i = 0; i < 110; i++) bits.push({
      x: Math.random() * w, y: -20 - Math.random() * h * 0.4,
      vx: (Math.random() - 0.5) * 2.2, vy: 2 + Math.random() * 3.5,
      s: 4 + Math.random() * 6, r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25, c: colors[i % colors.length]
    });
    var start = performance.now();
    (function frame(t) {
      var age = t - start;
      ctx.clearRect(0, 0, w, h);
      bits.forEach(function (b) {
        b.x += b.vx; b.y += b.vy; b.r += b.vr; b.vy += 0.02;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.r);
        ctx.globalAlpha = Math.max(0, 1 - age / 1400);
        ctx.fillStyle = b.c; ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * 0.6);
        ctx.restore();
      });
      if (age < 1400) requestAnimationFrame(frame); else c.remove();
    })(start);
  }

  /* ---------------- flashcards ---------------- */
  function initDeck() {
    var deck = document.querySelector('[data-deck]');
    if (!deck) return;
    var cards = Array.prototype.slice.call(deck.querySelectorAll('.fc'));
    if (!cards.length) return;
    var order = cards.map(function (_, i) { return i; }), pos = 0;

    function show() {
      cards.forEach(function (c, i) { c.hidden = i !== order[pos]; c.removeAttribute('data-flipped'); });
      var n = deck.querySelector('.deck__count');
      if (n) n.textContent = (pos + 1) + ' / ' + cards.length;
    }
    function flip() { cards[order[pos]].toggleAttribute('data-flipped'); }
    function step(d) { pos = (pos + d + cards.length) % cards.length; show(); }

    cards.forEach(function (c) {
      c.setAttribute('tabindex', '0');
      c.setAttribute('role', 'button');
      c.setAttribute('aria-label', 'Flashcard — activate to flip');
      c.addEventListener('click', flip);
      c.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      });
    });
    var prev = deck.querySelector('[data-deck-prev]'), next = deck.querySelector('[data-deck-next]'),
        sh = deck.querySelector('[data-deck-shuffle]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    if (sh) sh.addEventListener('click', function () {
      for (var i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t;
      }
      pos = 0; show();
    });
    show();
  }

  /* ---------------- project checklist ---------------- */
  function initChecklist() {
    var list = document.querySelector('[data-checklist]');
    if (!list) return;
    var id = list.getAttribute('data-checklist');
    var st = Store.get();
    st.projects[id] = st.projects[id] || { steps: [] };
    var boxes = list.querySelectorAll('input[type=checkbox]');
    boxes.forEach(function (b, i) {
      b.checked = !!st.projects[id].steps[i];
      b.addEventListener('change', function () {
        Store.get().projects[id].steps[i] = b.checked; Store.save();
      });
    });
  }

  /* ---------------- certificate ---------------- */
  function initCertificate() {
    var root = document.querySelector('[data-certificate]');
    if (!root) return;
    var st = Store.get();
    var input = root.querySelector('[data-cert-name]');
    var nameEl = root.querySelector('.cert__name');
    if (input) {
      input.value = st.name || '';
      input.addEventListener('input', function () {
        Store.get().name = input.value.trim() || null; Store.save(); paint();
      });
    }
    function paint() {
      var s = Store.get();
      if (nameEl) nameEl.textContent = s.name || 'Enter your name above';
      var units = CFG.units || [];
      var taken = units.filter(function (u) { return s.tests[u.id]; });
      var body = root.querySelector('[data-cert-rows]');
      if (body) {
        body.innerHTML = '';
        units.forEach(function (u) {
          var rec = s.tests[u.id];
          var tr = document.createElement('tr');
          var td1 = document.createElement('td'); td1.textContent = u.title || u.id;
          var td2 = document.createElement('td');
          td2.textContent = rec ? rec.score + '/' + rec.total +
            ' (' + Math.round((rec.score / rec.total) * 100) + '%)' : 'not attempted';
          tr.appendChild(td1); tr.appendChild(td2); body.appendChild(tr);
        });
      }
      var a = avg(testScores());
      var avgEl = root.querySelector('[data-cert-avg]');
      if (avgEl) avgEl.textContent = a === null ? '—' : a + '%';
      var dateEl = root.querySelector('[data-cert-date]');
      if (dateEl) {
        var last = 0;
        units.forEach(function (u) { if (s.tests[u.id] && s.tests[u.id].at > last) last = s.tests[u.id].at; });
        dateEl.textContent = last ? new Date(last).toLocaleDateString() : '—';
      }
      var incomplete = root.querySelector('[data-cert-incomplete]');
      var issued = root.querySelector('[data-cert-issued]');
      var done = units.length > 0 && taken.length === units.length;
      if (incomplete) incomplete.hidden = done;
      if (issued) issued.hidden = !done;
    }
    paint();
    var print = root.querySelector('[data-print]');
    if (print) print.addEventListener('click', function () { window.print(); });
  }

  /* ---------------- reset ---------------- */
  function initReset() {
    var dlg = document.getElementById('reset-dialog');
    document.querySelectorAll('[data-reset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (dlg && dlg.showModal) dlg.showModal();
        else if (confirm('Erase all saved progress for this course?')) doReset();
      });
    });
    if (!dlg) return;
    var yes = dlg.querySelector('[data-reset-confirm]');
    var no = dlg.querySelector('[data-reset-cancel]');
    if (yes) yes.addEventListener('click', function () { doReset(); dlg.close(); });
    if (no) no.addEventListener('click', function () { dlg.close(); });
    function doReset() {
      Store.reset();
      render(); initCertificate();
      document.querySelectorAll('.q[data-locked]').forEach(function (q) { q.removeAttribute('data-locked'); });
      announce('Progress reset. All saved scores and reading progress have been erased.');
    }
  }

  /* ---------------- search ---------------- */
  function initSearch() {
    var box = document.querySelector('[data-search]');
    if (!box) return;
    var input = box.querySelector('input'), out = box.querySelector('.search__results');
    var idx = json('search-index'), active = -1;
    if (!idx) {
      fetch('assets/search.json').then(function (r) { return r.json(); })
        .then(function (d) { idx = d; }).catch(function () { box.hidden = true; });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input &&
          !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
    });
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      var links = out.querySelectorAll('a');
      if (e.key === 'Escape') { input.value = ''; run(); input.blur(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = Math.max(0, Math.min(links.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)));
        links.forEach(function (l, i) { l.classList.toggle('is-active', i === active); });
      }
      if (e.key === 'Enter' && links[active]) location.href = links[active].href;
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) out.hidden = true; });

    function run() {
      var q = input.value.trim().toLowerCase();
      active = -1; out.innerHTML = '';
      if (!q || !idx) { out.hidden = true; return; }
      var hits = idx.filter(function (r) {
        return (r.title + ' ' + (r.unit || '') + ' ' + (r.text || '')).toLowerCase().indexOf(q) > -1;
      }).slice(0, 12);
      if (!hits.length) {
        out.innerHTML = '<a href="index.html"><strong>No matches</strong><small>Browse the syllabus</small></a>';
      } else hits.forEach(function (r) {
        var a = document.createElement('a');
        a.href = r.href;
        a.innerHTML = '<strong></strong><small></small>';
        a.querySelector('strong').textContent = r.title;
        a.querySelector('small').textContent = r.unit || '';
        out.appendChild(a);
      });
      out.hidden = false;
    }
  }

  /* ---------------- misc ---------------- */
  function initCopy() {
    document.querySelectorAll('pre > code').forEach(function (code) {
      var pre = code.parentNode;
      var b = document.createElement('button');
      b.className = 'btn copy-btn'; b.textContent = 'Copy'; b.type = 'button';
      b.addEventListener('click', function () {
        var text = code.textContent;
        var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1400); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback);
        else fallback();
        function fallback() {
          var ta = document.createElement('textarea'); ta.value = text;
          document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); done(); } catch (e) {}
          ta.remove();
        }
      });
      pre.appendChild(b);
    });
  }

  function initSubnav() {
    var links = document.querySelectorAll('.subnav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (l) {
      var t = document.getElementById(l.getAttribute('href').slice(1));
      if (t) map[t.id] = l;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute('aria-current'); });
          if (map[en.target.id]) map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  function boot() {
    initTheme(); render(); trackVisit();
    initReading(); initQuiz(); initDeck(); initChecklist();
    initCertificate(); initReset(); initSearch(); initCopy(); initSubnav();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
