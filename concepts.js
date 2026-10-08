// Booleans section: two games, Boolean Expressions and Boolean Truth Tables.
// Operators are Java-style (&&, ||, !, ==, !=).
// Load this AFTER data.js and script.js in index.html.

(function () {
  const $ = id => document.getElementById(id);
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const P = list => list[R(0, list.length - 1)];
  const rb = () => Math.random() < 0.5;
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // How the two values are written everywhere in the games.
  const TRUE_WORD = "True", FALSE_WORD = "False";
  const T = v => (v ? TRUE_WORD : FALSE_WORD);
  const NEXT_DELAY = 450; // ms the green flash stays after a correct answer

  // Which panel of the card is showing
  const PANELS = { idle: "bool-idle", mode: "bool-mode", pick: "bool-pick", play: "bool-play", tt: "tt-play" };
  function show(which) {
    for (const k in PANELS) $(PANELS[k]).hidden = (k !== which);
  }

  /* =====================================================
     GAME 1: BOOLEAN EXPRESSIONS
     ===================================================== */
  const CMP = {
    ">": (a, b) => a > b, "<": (a, b) => a < b,
    ">=": (a, b) => a >= b, "<=": (a, b) => a <= b,
    "==": (a, b) => a === b, "!=": (a, b) => a !== b
  };

  let useNumbers = true; // set by the toggle on the difficulty screen

  // A node is { t: "lit" | "cmp" | "not" | "and" | "or", ... }
  const lit = () => ({ t: "lit", v: rb() });
  const not = x => ({ t: "not", x });
  const bin = (t, l, r) => ({ t, l, r });
  const op = () => P(["and", "or"]);
  function cmp() {
    const a = R(1, 9);
    let b = R(1, 9);
    const o = P(Object.keys(CMP));
    if ((o === "==" || o === "!=") && Math.random() < 0.5) b = a;
    return { t: "cmp", a, b, op: o };
  }
  // One piece of an expression. `numbers` is the chance it is a comparison like 5 > 3.
  function term(numbers) {
    if (useNumbers && Math.random() < numbers) return Math.random() < 0.35 ? not(cmp()) : cmp();
    return Math.random() < 0.3 ? not(lit()) : lit();
  }

  // limit = seconds per question (0 means no timer)
  const DIFFS = {
    easy: { name: "Easy", mode: "full", limit: 0, make: () => P([
      () => not(lit()),
      () => bin(op(), lit(), lit()),
      () => bin(op(), lit(), lit()),
      () => (useNumbers ? cmp() : bin(op(), lit(), lit()))
    ])() },
    normal: { name: "Normal", mode: "full", limit: 0, make: () => bin(op(), term(0.2), term(0.2)) },
    medium: { name: "Medium", mode: "full", limit: 20, make: () => bin(op(), bin(op(), term(0.2), term(0.2)), term(0.2)) },
    hard: { name: "Hard", mode: "min", limit: 15, make: () => P([
      () => bin(op(), not(bin(op(), term(0.25), term(0.25))), term(0.25)),
      () => bin("or", term(0.25), bin("and", term(0.25), term(0.25))),
      () => bin("and", bin("or", term(0.25), term(0.25)), not(term(0.25)))
    ])() }
  };

  const prec = n => ({ or: 1, and: 2, not: 3, cmp: 4, lit: 5 })[n.t];
  const SYM = { and: "&&", or: "||" };
  const MARK_ON = "\u0001", MARK_OFF = "\u0002"; // wraps the piece that just changed

  // mode "full" wraps every group in ( ). mode "min" only uses ( ) where they are needed.
  function str(n, mode) {
    if (n.t === "lit") return n.mark ? MARK_ON + T(n.v) + MARK_OFF : T(n.v);
    if (n.t === "cmp") return n.a + " " + n.op + " " + n.b;
    if (n.t === "not") {
      const s = str(n.x, mode);
      return "!" + (n.x.t === "lit" || n.x.t === "not" ? s : "(" + s + ")");
    }
    const wrap = c => {
      const s = str(c, mode);
      const need = mode === "full" ? (c.t !== "lit" && c.t !== "not") : prec(c) < prec(n);
      return need ? "(" + s + ")" : s;
    };
    return wrap(n.l) + " " + SYM[n.t] + " " + wrap(n.r);
  }

  function ev(n) {
    if (n.t === "lit") return n.v;
    if (n.t === "cmp") return CMP[n.op](n.a, n.b);
    if (n.t === "not") return !ev(n.x);
    return n.t === "and" ? ev(n.l) && ev(n.r) : ev(n.l) || ev(n.r);
  }

  // Shrinks the expression one piece at a time and records each step for Explain.
  function steps(root, mode) {
    const out = [];
    const ready = n => n.t === "cmp" || (n.t === "not" && n.x.t === "lit") ||
      ((n.t === "and" || n.t === "or") && n.l.t === "lit" && n.r.t === "lit");
    const find = n => {
      if (n.t === "lit") return null;
      for (const k of ["x", "l", "r"]) if (n[k]) { const f = find(n[k]); if (f) return f; }
      return ready(n) ? n : null;
    };
    let n;
    while ((n = find(root))) {
      const v = ev(n);
      let text;
      if (n.t === "cmp") text = `${n.a} ${n.op} ${n.b} is ${T(v)}.`;
      else if (n.t === "not") text = `! flips ${T(n.x.v)} to ${T(v)}.`;
      else if (n.t === "and") text = `${T(n.l.v)} && ${T(n.r.v)} is ${T(v)}. && is true only when both sides are true.`;
      else text = `${T(n.l.v)} || ${T(n.r.v)} is ${T(v)}. || is true when at least one side is true.`;
      Object.keys(n).forEach(k => delete n[k]);
      n.t = "lit"; n.v = v; n.mark = true;
      const now = str(root, mode);
      delete n.mark;
      out.push({ text, now });
    }
    return out;
  }

  let S = null, timer = null, qTimer = null;

  function begin(key) {
    useNumbers = $("bool-numbers").checked;
    S = { d: DIFFS[key], score: 0, streak: 0, last: "" };
    const badge = $("bool-badge");
    badge.textContent = S.d.limit ? `${S.d.name} · ${S.d.limit}s` : S.d.name;
    badge.className = "badge diff-" + key;
    show("play");
    next();
  }

  function next() {
    clearTimeout(timer);
    let q, s;
    do { q = S.d.make(); s = str(q, S.d.mode); } while (s === S.last);
    S.last = s;
    S.expr = s;
    S.answer = ev(q);
    S.steps = steps(JSON.parse(JSON.stringify(q)), S.d.mode);
    S.shown = 0;
    S.locked = false;
    const ex = $("bool-expr");
    ex.textContent = s;
    ex.classList.remove("swap"); void ex.offsetWidth; ex.classList.add("swap");
    for (const b of [$("bool-true"), $("bool-false")]) { b.className = "ans"; b.disabled = false; }
    $("bool-explain").disabled = false;
    $("bool-next").hidden = true;
    $("bool-box").hidden = true;
    stats();
    startTimer();
  }

  function stats() {
    if (S) $("bool-stats").textContent = `Score ${S.score} · Streak ${S.streak}`;
  }

  /* question timer: a thin bar that empties, only on levels with a limit */
  function startTimer() {
    clearTimeout(qTimer);
    const box = $("bool-timer"), fill = $("bool-timer-fill");
    if (!S.d.limit) { box.hidden = true; return; }
    box.hidden = false;
    fill.style.transition = "none";
    fill.style.width = "100%";
    void fill.offsetWidth;
    fill.style.transition = `width ${S.d.limit}s linear`;
    fill.style.width = "0%";
    qTimer = setTimeout(timeUp, S.d.limit * 1000);
  }

  function freezeTimer() {
    clearTimeout(qTimer);
    if (!S.d.limit) return;
    const fill = $("bool-timer-fill");
    fill.style.width = getComputedStyle(fill).width;
    fill.style.transition = "none";
  }

  function showCorrect() {
    (S.answer ? $("bool-true") : $("bool-false")).classList.add("good");
  }

  // Wrong answer, out of time, or Explain finished: lock the question and reset the streak.
  function lose(pick) {
    S.locked = true;
    freezeTimer();
    $("bool-true").disabled = $("bool-false").disabled = true;
    if (pick) pick.classList.add("bad");
    showCorrect();
    S.streak = 0;
    stats();
    $("bool-next").hidden = false;
  }

  function openExplain() {
    $("bool-box").hidden = false;
    renderExplain();
  }

  function timeUp() {
    if (!S || S.locked) return;
    lose(null);
    openExplain();
  }

  function answer(v) {
    if (!S || S.locked) return;
    const pick = v ? $("bool-true") : $("bool-false");
    if (v === S.answer) {
      S.locked = true;
      freezeTimer();
      $("bool-true").disabled = $("bool-false").disabled = true;
      pick.classList.add("good");
      S.score++; S.streak++;
      stats();
      $("bool-explain").disabled = true;
      timer = setTimeout(next, NEXT_DELAY);
    } else {
      lose(pick);
      openExplain();
    }
  }

  const hl = s => esc(s).replace(/\u0001/g, "<mark>").replace(/\u0002/g, "</mark>");

  function renderExplain() {
    let h = `<p>Start: <code>${esc(S.expr)}</code></p>`;
    for (let i = 0; i < S.shown; i++) {
      h += `<div class="step"><p>${esc(S.steps[i].text)}</p><p>Now: <code>${hl(S.steps[i].now)}</code></p></div>`;
    }
    if (S.shown < S.steps.length) {
      h += `<button type="button" class="btn btn-explain" id="bool-step">Next step</button>`;
    } else {
      h += `<p><strong>The answer is ${T(S.answer)}.</strong></p>`;
    }
    $("bool-box").innerHTML = h;
    const stepBtn = $("bool-step");
    if (stepBtn) stepBtn.onclick = () => {
      S.shown++;
      // Going all the way through Explain before answering counts as a wrong answer.
      if (S.shown >= S.steps.length && !S.locked) lose(null);
      renderExplain();
    };
  }

  function toggleExplain() {
    if (!S) return;
    if ($("bool-box").hidden) openExplain(); else $("bool-box").hidden = true;
  }

  /* =====================================================
     GAME 2: BOOLEAN TRUTH TABLES
     The table shows x, y and a result. Build the expression that makes it.
     Every answer looks like  [!]x  (&& or ||)  [!]y
     ===================================================== */
  let TS = null, ttTimer = null;
  const ROWS = [[true, true], [true, false], [false, true], [false, false]];

  // c = { nx: x is negated, ny: y is negated, or: uses || instead of && }
  function ttEval(c, x, y) {
    const a = c.nx ? !x : x;
    const b = c.ny ? !y : y;
    return c.or ? (a || b) : (a && b);
  }
  const ttLabel = c => `${c.nx ? "!" : ""}x ${c.or ? "||" : "&&"} ${c.ny ? "!" : ""}y`;

  function ttBegin() {
    TS = { score: 0, streak: 0, last: "" };
    show("tt");
    ttNext();
  }

  function ttNext() {
    clearTimeout(ttTimer);
    let t, key;
    do { t = { nx: rb(), ny: rb(), or: rb() }; key = [t.nx, t.ny, t.or].join(); } while (key === TS.last);
    TS.last = key;
    TS.target = t;
    TS.pick = { nx: false, ny: false, or: false }; // starts as x && y
    TS.locked = false;
    $("tt-table").innerHTML = "<tr><th>x</th><th>y</th><th>Result</th></tr>" +
      ROWS.map(([x, y]) => `<tr><td>${T(x)}</td><td>${T(y)}</td><td>${T(ttEval(t, x, y))}</td></tr>`).join("");
    $("tt-answer").hidden = true;
    $("tt-next").hidden = true;
    $("tt-submit").disabled = false;
    ttButtons();
    ttStats();
  }

  function ttStats() {
    if (TS) $("tt-stats").textContent = `Score ${TS.score} · Streak ${TS.streak}`;
  }

  function ttButtons() {
    const p = TS.pick;
    const set = (id, text, on) => {
      const b = $(id);
      b.textContent = text;
      b.className = "ans" + (on ? " on" : "");
      b.disabled = false;
      b.setAttribute("aria-pressed", on);
    };
    set("tt-x", p.nx ? "!x" : "x", p.nx);
    set("tt-op", p.or ? "||" : "&&", p.or);
    set("tt-y", p.ny ? "!y" : "y", p.ny);
  }

  function ttToggle(key) {
    if (!TS || TS.locked) return;
    TS.pick[key] = !TS.pick[key];
    ttButtons();
  }

  function ttSubmit() {
    if (!TS || TS.locked) return;
    TS.locked = true;
    const p = TS.pick, t = TS.target;
    const parts = [["tt-x", p.nx === t.nx], ["tt-op", p.or === t.or], ["tt-y", p.ny === t.ny]];
    parts.forEach(([id, ok]) => {
      const b = $(id);
      b.classList.add(ok ? "good" : "bad");
      b.disabled = true;
    });
    $("tt-submit").disabled = true;
    if (parts.every(part => part[1])) {
      TS.score++; TS.streak++;
      ttStats();
      ttTimer = setTimeout(ttNext, NEXT_DELAY);
    } else {
      TS.streak = 0;
      ttStats();
      $("tt-answer").textContent = "Answer: " + ttLabel(t);
      $("tt-answer").hidden = false;
      $("tt-next").hidden = false;
    }
  }

  /* =====================================================
     WIRING
     ===================================================== */
  function stop() {
    clearTimeout(timer); clearTimeout(qTimer); clearTimeout(ttTimer);
    S = null; TS = null;
    show("idle");
  }

  $("bool-true").textContent = TRUE_WORD;
  $("bool-false").textContent = FALSE_WORD;

  $("bool-start").onclick = () => show("mode");
  $("mode-back").onclick = () => show("idle");
  $("mode-expr").onclick = () => show("pick");
  $("mode-tt").onclick = ttBegin;
  $("bool-cancel").onclick = () => show("mode");
  document.querySelectorAll("#bool-pick [data-diff]").forEach(b => {
    b.onclick = () => begin(b.dataset.diff);
  });

  $("bool-true").onclick = () => answer(true);
  $("bool-false").onclick = () => answer(false);
  $("bool-explain").onclick = toggleExplain;
  $("bool-next").onclick = next;
  $("bool-stop").onclick = stop;

  $("tt-x").onclick = () => ttToggle("nx");
  $("tt-op").onclick = () => ttToggle("or");
  $("tt-y").onclick = () => ttToggle("ny");
  $("tt-submit").onclick = ttSubmit;
  $("tt-next").onclick = ttNext;
  $("tt-stop").onclick = stop;
})();
