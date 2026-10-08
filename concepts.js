// Boolean Expressions game for the Concepts section.
// Syntax is Java-style (&&, ||, !, ==, !=), which reads the same in JavaScript.
// Load this AFTER data.js and script.js in index.html.

(function () {
  const $ = id => document.getElementById(id);
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const P = list => list[R(0, list.length - 1)];
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const CMP = {
    ">": (a, b) => a > b, "<": (a, b) => a < b,
    ">=": (a, b) => a >= b, "<=": (a, b) => a <= b,
    "==": (a, b) => a === b, "!=": (a, b) => a !== b
  };

  /* ---------- building expressions ---------- */
  // A node is { t: "lit" | "cmp" | "not" | "and" | "or", ... }
  const lit = () => ({ t: "lit", v: Math.random() < 0.5 });
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
    if (Math.random() < numbers) return Math.random() < 0.35 ? not(cmp()) : cmp();
    return Math.random() < 0.3 ? not(lit()) : lit();
  }

  const DIFFS = {
    easy: { name: "Easy", mode: "full", make: () => P([
      () => not(lit()),
      () => bin(op(), lit(), lit()),
      () => bin(op(), lit(), lit()),
      () => cmp()
    ])() },
    normal: { name: "Normal", mode: "full", make: () => bin(op(), term(0.2), term(0.2)) },
    medium: { name: "Medium", mode: "full", make: () => bin(op(), bin(op(), term(0.2), term(0.2)), term(0.2)) },
    hard: { name: "Hard", mode: "min", make: () => P([
      () => bin(op(), not(bin(op(), term(0.25), term(0.25))), term(0.25)),
      () => bin("or", term(0.25), bin("and", term(0.25), term(0.25))),
      () => bin("and", bin("or", term(0.25), term(0.25)), not(term(0.25)))
    ])() },
    extreme: { name: "Extreme", mode: "min", make: () => P([
      () => bin("or", bin("and", term(0.2), term(0.2)), bin("and", term(0.2), not(bin("or", term(0.2), term(0.2))))),
      () => bin("and", bin("or", term(0.2), not(bin("and", term(0.2), term(0.2)))), bin("or", term(0.2), term(0.2))),
      () => bin("or", not(bin("and", term(0.2), bin("or", term(0.2), term(0.2)))), bin("and", term(0.2), term(0.2)))
    ])() }
  };

  /* ---------- printing and solving ---------- */
  const prec = n => ({ or: 1, and: 2, not: 3, cmp: 4, lit: 5 })[n.t];
  const SYM = { and: "&&", or: "||" };

  // mode "full" wraps every group in ( ). mode "min" only uses ( ) where they are needed.
  function str(n, mode) {
    if (n.t === "lit") return String(n.v);
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
      if (n.t === "cmp") text = `${n.a} ${n.op} ${n.b} is ${v}.`;
      else if (n.t === "not") text = `! flips ${n.x.v} to ${v}.`;
      else if (n.t === "and") text = `${n.l.v} && ${n.r.v} is ${v}. && is true only when both sides are true.`;
      else text = `${n.l.v} || ${n.r.v} is ${v}. || is true when at least one side is true.`;
      Object.keys(n).forEach(k => delete n[k]);
      n.t = "lit"; n.v = v;
      out.push({ text, now: str(root, mode) });
    }
    return out;
  }

  /* ---------- the game ---------- */
  let S = null, timer = null;

  function show(which) {
    ["idle", "pick", "play"].forEach(k => { $("bool-" + k).hidden = (k !== which); });
  }

  function begin(key) {
    S = { key, d: DIFFS[key], score: 0, streak: 0, last: "" };
    const badge = $("bool-badge");
    badge.textContent = S.d.name;
    badge.className = "badge diff-" + key;
    show("play");
    next();
  }

  function stop() {
    clearTimeout(timer);
    S = null;
    show("idle");
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
    S.gaveUp = false;
    $("bool-expr").textContent = s;
    for (const b of [$("bool-true"), $("bool-false")]) { b.className = "ans"; b.disabled = false; }
    $("bool-explain").disabled = false;
    $("bool-next").hidden = true;
    $("bool-box").hidden = true;
    stats();
  }

  function stats() {
    $("bool-stats").textContent = `Score ${S.score}, streak ${S.streak}`;
  }

  function showCorrect() {
    (S.answer ? $("bool-true") : $("bool-false")).classList.add("good");
  }

  function answer(v) {
    if (!S || S.locked) return;
    S.locked = true;
    $("bool-true").disabled = $("bool-false").disabled = true;
    const pick = v ? $("bool-true") : $("bool-false");
    if (v === S.answer) {
      pick.classList.add("good");
      S.score++; S.streak++;
      stats();
      $("bool-explain").disabled = true;
      timer = setTimeout(next, 1000);
    } else {
      pick.classList.add("bad");
      showCorrect();
      S.streak = 0;
      stats();
      $("bool-box").hidden = false;
      renderExplain();
      $("bool-next").hidden = false;
    }
  }

  function renderExplain() {
    const box = $("bool-box");
    let h = `<p>Start: <code>${esc(S.expr)}</code></p>`;
    for (let i = 0; i < S.shown; i++) {
      h += `<div class="step"><p>${esc(S.steps[i].text)}</p><p>Now: <code>${esc(S.steps[i].now)}</code></p></div>`;
    }
    const done = S.shown >= S.steps.length;
    if (!done) {
      h += `<button type="button" class="btn btn-explain" id="bool-step">Next step</button>`;
    } else {
      h += `<p><strong>The answer is ${S.answer}.</strong></p>`;
      if (S.gaveUp) h += `<p class="note">Counted as wrong because Explain gave away the answer.</p>`;
    }
    box.innerHTML = h;
    const stepBtn = $("bool-step");
    if (stepBtn) stepBtn.onclick = () => { S.shown++; finishIfDone(); renderExplain(); };
  }

  // Walking all the way through Explain before answering counts as a wrong answer.
  function finishIfDone() {
    if (S.shown < S.steps.length || S.locked) return;
    S.locked = true;
    S.gaveUp = true;
    $("bool-true").disabled = $("bool-false").disabled = true;
    showCorrect();
    S.streak = 0;
    stats();
    $("bool-next").hidden = false;
  }

  function toggleExplain() {
    if (!S) return;
    const box = $("bool-box");
    if (box.hidden) { box.hidden = false; renderExplain(); } else { box.hidden = true; }
  }

  $("bool-start").onclick = () => show("pick");
  $("bool-cancel").onclick = () => show("idle");
  document.querySelectorAll("#bool-pick [data-diff]").forEach(b => {
    b.onclick = () => begin(b.dataset.diff);
  });
  $("bool-true").onclick = () => answer(true);
  $("bool-false").onclick = () => answer(false);
  $("bool-explain").onclick = toggleExplain;
  $("bool-next").onclick = next;
  $("bool-stop").onclick = stop;
})();
