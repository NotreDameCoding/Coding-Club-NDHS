// Coding Games: Booleans, HTML Tags, and Flexbox.
// Each game is its own block below and only touches its own ids (bool-, tag-, flex-).
// Load this AFTER data.js and script.js in index.html.

(function () {
  const $ = id => document.getElementById(id);
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const P = list => list[R(0, list.length - 1)];
  const rb = () => Math.random() < 0.5;
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const shuffle = list => {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) { const j = R(0, i); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const NEXT_DELAY = 450; // ms the green flash stays after a correct answer

  // Shows one panel of a game card and hides the others
  const panels = map => which => { for (const k in map) $(map[k]).hidden = (k !== which); };

  // Difficulty badge in a game's bottom bar, like "Easy" in green
  function setBadge(id, key, text) {
    const b = $(id);
    b.textContent = text;
    b.className = "badge diff-" + key;
  }

  // Makes an answer button
  function ansButton(text, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ans";
    b.textContent = text;
    b.onclick = onClick;
    return b;
  }

  // A line of text where `backtick` parts become <code> (safe, no innerHTML)
  function line(text) {
    const p = document.createElement("p");
    String(text).split("`").forEach((part, i) => {
      if (!part) return;
      if (i % 2) { const c = document.createElement("code"); c.textContent = part; p.append(c); }
      else p.append(document.createTextNode(part));
    });
    return p;
  }

  /* =====================================================
     GAME 1: BOOLEANS
     Operators are Java-style (&&, ||, !, ==, !=).
     ===================================================== */
  (function () {
    // How the two values are written everywhere in the game.
    const TRUE_WORD = "True", FALSE_WORD = "False";
    const T = v => (v ? TRUE_WORD : FALSE_WORD);
    const show = panels({ idle: "bool-idle", pick: "bool-pick", play: "bool-play" });

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
    // Comparing two booleans, like True == False or False != True
    function beq() {
      return { t: "cmp", a: rb(), b: rb(), op: rb() ? "==" : "!=", bool: true };
    }
    // One piece of an expression. `numbers` is the chance it is a number comparison like 5 > 3.
    function term(numbers) {
      let x;
      if (useNumbers && Math.random() < numbers) x = cmp();
      else if (Math.random() < 0.22) x = beq();
      else x = lit();
      return Math.random() < 0.3 ? not(x) : x;
    }

    // limit = seconds per question (0 means no timer)
    const DIFFS = {
      easy: { name: "Easy", mode: "full", limit: 0, make: () => P([
        () => not(lit()),
        () => bin(op(), lit(), lit()),
        () => bin(op(), lit(), lit()),
        () => beq(),
        () => (useNumbers ? cmp() : beq())
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
      if (n.t === "cmp") return n.bool ? T(n.a) + " " + n.op + " " + T(n.b) : n.a + " " + n.op + " " + n.b;
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
        if (n.t === "cmp") text = n.bool ? `${T(n.a)} ${n.op} ${T(n.b)} is ${T(v)}.` : `${n.a} ${n.op} ${n.b} is ${T(v)}.`;
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
      setBadge("bool-badge", key, S.d.limit ? `${S.d.name} · ${S.d.limit}s` : S.d.name);
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
      $("bool-expr").textContent = s;
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

    // Wrong answer, out of time, or Explain opened: lock the question and reset the streak.
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
        h += `<div class="step"><p>${esc(S.steps[i].text)}</p><p><code>${hl(S.steps[i].now)}</code></p></div>`;
      }
      if (S.shown < S.steps.length) {
        h += `<button type="button" class="btn btn-explain" id="bool-step">Next step</button>`;
      } else {
        h += `<p><strong>The answer is ${T(S.answer)}.</strong></p>`;
      }
      $("bool-box").innerHTML = h;
      const stepBtn = $("bool-step");
      if (stepBtn) stepBtn.onclick = () => { S.shown++; renderExplain(); };
    }

    function toggleExplain() {
      if (!S) return;
      // Opening Explain before answering counts as a wrong answer right away.
      if (!S.locked) lose(null);
      if ($("bool-box").hidden) openExplain(); else $("bool-box").hidden = true;
    }

    function stop() {
      clearTimeout(timer); clearTimeout(qTimer);
      S = null;
      show("idle");
    }

    $("bool-true").textContent = TRUE_WORD;
    $("bool-false").textContent = FALSE_WORD;
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

  /* =====================================================
     GAME 2: HTML TAGS
     Read what an element does, then pick the tag that makes it.
     ===================================================== */
  (function () {
    const show = panels({ idle: "tag-idle", pick: "tag-pick", play: "tag-play" });

    // lvl: 1 shows up from Easy, 2 from Normal, 3 only on Hard.
    // group: Hard mode picks wrong answers from the same group, so they look alike.
    const TAGS = [
      { tag: "h1", lvl: 1, group: "text", does: "The biggest, most important heading on the page", ex: "<h1>Notre Dame Coding</h1>" },
      { tag: "p", lvl: 1, group: "text", does: "A paragraph of text", ex: "<p>We meet every week.</p>" },
      { tag: "a", lvl: 1, group: "media", does: "A link to another page", ex: "<a href=\"members.html\">Members</a>" },
      { tag: "img", lvl: 1, group: "media", does: "Shows a picture", ex: "<img src=\"knight.png\" alt=\"Our mascot\">" },
      { tag: "ul", lvl: 1, group: "list", does: "A bulleted list", ex: "<ul><li>HTML</li><li>CSS</li></ul>" },
      { tag: "li", lvl: 1, group: "list", does: "One item inside a list", ex: "<li>JavaScript</li>" },
      { tag: "button", lvl: 1, group: "media", does: "Something the user can click to do an action", ex: "<button>Practice</button>" },
      { tag: "h2", lvl: 2, group: "text", does: "A smaller heading, one step under the main one", ex: "<h2>Meetings</h2>" },
      { tag: "strong", lvl: 2, group: "text", does: "Bold text that is important", ex: "<strong>No meeting this week!</strong>" },
      { tag: "em", lvl: 2, group: "text", does: "Italic text for emphasis", ex: "<em>really</em> fun" },
      { tag: "ol", lvl: 2, group: "list", does: "A numbered list", ex: "<ol><li>Fork</li><li>Edit</li><li>Commit</li></ol>" },
      { tag: "div", lvl: 2, group: "layout", does: "A plain box for grouping other elements", ex: "<div class=\"card\">...</div>" },
      { tag: "span", lvl: 2, group: "text", does: "Wraps a few words inside a line so you can style them", ex: "We have <span class=\"count\">40</span> members" },
      { tag: "input", lvl: 2, group: "media", does: "A box where the user can type", ex: "<input type=\"text\" placeholder=\"Your name\">" },
      { tag: "title", lvl: 2, group: "page", does: "The page name shown on the browser tab", ex: "<title>Coding Club</title>" },
      { tag: "body", lvl: 2, group: "page", does: "Holds everything you can see on the page", ex: "<body> ...the whole page... </body>" },
      { tag: "head", lvl: 3, group: "page", does: "Holds info about the page, like its title and stylesheets", ex: "<head><title>Coding Club</title></head>" },
      { tag: "link", lvl: 3, group: "page", does: "Connects a CSS file to the page", ex: "<link rel=\"stylesheet\" href=\"style.css\">" },
      { tag: "script", lvl: 3, group: "page", does: "Adds JavaScript to the page", ex: "<script src=\"games.js\"></script>" },
      { tag: "table", lvl: 3, group: "media", does: "A grid of rows and columns", ex: "<table><tr><td>x</td><td>y</td></tr></table>" },
      { tag: "header", lvl: 3, group: "layout", does: "The top area of a page, often with the logo and menu", ex: "<header>Coding Club</header>" },
      { tag: "nav", lvl: 3, group: "layout", does: "A group of links for moving around the site", ex: "<nav><a href=\"#games\">Coding Games</a></nav>" },
      { tag: "main", lvl: 3, group: "layout", does: "The main content of the page (there's only one)", ex: "<main> ...sections... </main>" },
      { tag: "section", lvl: 3, group: "layout", does: "A themed part of the page, like Meetings or Members", ex: "<section id=\"members\">...</section>" },
      { tag: "footer", lvl: 3, group: "layout", does: "The bottom area of a page", ex: "<footer>Made by the Coding Club</footer>" }
    ];
    const DIFFS = {
      easy: { name: "Easy", lvl: 1, options: 3 },
      normal: { name: "Normal", lvl: 2, options: 4 },
      hard: { name: "Hard", lvl: 3, options: 4, lookAlike: true }
    };
    const label = t => "<" + t.tag + ">";
    const lower = s => s[0].toLowerCase() + s.slice(1);

    let G = null, timer = null;

    function begin(key) {
      G = { d: DIFFS[key], score: 0, streak: 0, last: null };
      setBadge("tag-badge", key, G.d.name);
      show("play");
      next();
    }

    function next() {
      clearTimeout(timer);
      const pool = TAGS.filter(t => t.lvl <= G.d.lvl);
      let q;
      do { q = P(pool); } while (q === G.last);
      G.last = q;
      G.q = q;
      G.locked = false;

      let others = shuffle(pool.filter(t => t !== q));
      if (G.d.lookAlike) {
        others = others.filter(t => t.group === q.group).concat(others.filter(t => t.group !== q.group));
      }
      const options = shuffle([q, ...others.slice(0, G.d.options - 1)]);

      $("tag-prompt").textContent = q.does;
      const box = $("tag-choices");
      box.textContent = "";
      options.forEach(t => {
        const b = ansButton(label(t), () => answer(t, b));
        b.dataset.tag = t.tag;
        box.append(b);
      });
      $("tag-next").hidden = true;
      $("tag-box").hidden = true;
      stats();
    }

    function stats() {
      if (G) $("tag-stats").textContent = `Score ${G.score} · Streak ${G.streak}`;
    }

    function answer(t, button) {
      if (!G || G.locked) return;
      G.locked = true;
      const buttons = $("tag-choices").querySelectorAll("button");
      buttons.forEach(b => { b.disabled = true; });
      if (t === G.q) {
        button.classList.add("good");
        G.score++; G.streak++;
        stats();
        timer = setTimeout(next, NEXT_DELAY);
        return;
      }
      button.classList.add("bad");
      buttons.forEach(b => { if (b.dataset.tag === G.q.tag) b.classList.add("good"); });
      G.streak = 0;
      stats();
      const box = $("tag-box");
      box.textContent = "";
      box.append(
        line(`The answer is \`${label(G.q)}\`: ${lower(G.q.does)}.`),
        line(`Example: \`${G.q.ex}\``),
        line(`\`${label(t)}\` is for something else: ${lower(t.does)}.`)
      );
      box.hidden = false;
      $("tag-next").hidden = false;
    }

    function stop() {
      clearTimeout(timer);
      G = null;
      show("idle");
    }

    $("tag-start").onclick = () => show("pick");
    $("tag-cancel").onclick = () => show("idle");
    document.querySelectorAll("#tag-pick [data-diff]").forEach(b => {
      b.onclick = () => begin(b.dataset.diff);
    });
    $("tag-next").onclick = next;
    $("tag-stop").onclick = stop;
  })();

  /* =====================================================
     GAME 3: FLEXBOX
     Look at the Target layout and find the CSS that makes it.
     ===================================================== */
  (function () {
    const show = panels({ idle: "flex-idle", pick: "flex-pick", play: "flex-play" });

    const JUSTIFY = ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"];
    const ALIGN = ["flex-start", "center", "flex-end"];
    // What each value does, for the explanation after a wrong answer
    const SAYS = {
      justify: {
        "flex-start": "packs the boxes at the left, the start of the row",
        "center": "bunches the boxes together in the middle",
        "flex-end": "packs the boxes at the right, the end of the row",
        "space-between": "puts the first box on the left edge, the last on the right edge, and equal space between them",
        "space-around": "gives each box equal space on both sides, so the gaps at the edges are half size",
        "space-evenly": "makes every gap the same size, including the gaps at the edges"
      },
      align: {
        "flex-start": "lines the boxes up along the top",
        "center": "lines the boxes up in the vertical middle",
        "flex-end": "lines the boxes up along the bottom"
      }
    };
    // Hard asks for both properties. Easy and Normal only ask for justify-content.
    const DIFFS = {
      easy: { name: "Easy", justify: JUSTIFY.slice(0, 3) },
      normal: { name: "Normal", justify: JUSTIFY.slice(0, 5) },
      hard: { name: "Hard", justify: JUSTIFY, align: ALIGN }
    };
    const DELAY = 700; // a bit longer than the other games, so you can see the layout match

    let F = null, timer = null;

    function layout(id, justify, align) {
      const s = $(id);
      s.style.justifyContent = justify;
      s.style.alignItems = align || "flex-start";
    }

    function begin(key) {
      F = { d: DIFFS[key], score: 0, streak: 0, last: "" };
      const hard = Boolean(F.d.align);
      setBadge("flex-badge", key, F.d.name);
      $("flex-ask").textContent = hard
        ? "Set justify-content and align-items so Yours matches the Target."
        : "Which justify-content value makes the Target layout?";
      $("flex-target").classList.toggle("tall", hard);
      $("flex-yours").classList.toggle("tall", hard);
      $("flex-quick").hidden = hard;
      $("flex-build").hidden = !hard;
      show("play");
      next();
    }

    function next() {
      clearTimeout(timer);
      let j, a, key;
      do {
        j = P(F.d.justify);
        a = F.d.align ? P(F.d.align) : "";
        key = j + a;
      } while (key === F.last);
      F.last = key;
      F.answer = { j, a };
      F.locked = false;
      layout("flex-target", j, a);
      $("flex-box").hidden = true;
      $("flex-next").hidden = true;

      if (F.d.align) {
        // Hard: Yours is always showing and updates as you pick
        F.pick = { j: "flex-start", a: "flex-start" };
        $("flex-yours-wrap").hidden = false;
        $("flex-boards").classList.add("two");
        buildRow("flex-j", F.d.justify, "j");
        buildRow("flex-a", F.d.align, "a");
        $("flex-submit").disabled = false;
        updateYours();
      } else {
        // Easy/Normal: Yours only appears after a wrong answer, to compare
        $("flex-yours-wrap").hidden = true;
        $("flex-boards").classList.remove("two");
        const box = $("flex-quick");
        box.textContent = "";
        F.d.justify.forEach(v => {
          const b = ansButton(v, () => quickAnswer(v, b));
          box.append(b);
        });
      }
      stats();
    }

    function stats() {
      if (F) $("flex-stats").textContent = `Score ${F.score} · Streak ${F.streak}`;
    }

    function explain(lines) {
      const box = $("flex-box");
      box.textContent = "";
      lines.forEach(t => box.append(line(t)));
      box.hidden = false;
    }

    /* Easy and Normal: one click answers */
    function quickAnswer(v, button) {
      if (!F || F.locked) return;
      F.locked = true;
      const buttons = $("flex-quick").querySelectorAll("button");
      buttons.forEach(b => { b.disabled = true; });
      if (v === F.answer.j) {
        button.classList.add("good");
        F.score++; F.streak++;
        stats();
        timer = setTimeout(next, DELAY);
        return;
      }
      button.classList.add("bad");
      buttons.forEach(b => { if (b.textContent === F.answer.j) b.classList.add("good"); });
      F.streak = 0;
      stats();
      layout("flex-yours", v, "");
      $("flex-yours-wrap").hidden = false;
      $("flex-boards").classList.add("two");
      explain([
        `The answer is \`justify-content: ${F.answer.j}\`. It ${SAYS.justify[F.answer.j]}.`,
        `You picked \`${v}\`, which ${SAYS.justify[v]}.`
      ]);
      $("flex-next").hidden = false;
    }

    /* Hard: pick a value for each property, then Submit */
    function buildRow(id, values, prop) {
      const row = $(id);
      row.textContent = "";
      values.forEach(v => {
        const b = ansButton(v, () => {
          if (!F || F.locked) return;
          F.pick[prop] = v;
          updateYours();
        });
        b.dataset.value = v;
        row.append(b);
      });
    }

    function updateYours() {
      layout("flex-yours", F.pick.j, F.pick.a);
      $("flex-css").textContent = `justify-content: ${F.pick.j}; align-items: ${F.pick.a};`;
      for (const [id, prop] of [["flex-j", "j"], ["flex-a", "a"]]) {
        $(id).querySelectorAll("button").forEach(b => {
          b.setAttribute("aria-pressed", String(b.dataset.value === F.pick[prop]));
        });
      }
    }

    function submit() {
      if (!F || F.locked) return;
      F.locked = true;
      $("flex-submit").disabled = true;
      const lines = [];
      let right = true;
      for (const [id, prop, name, says] of [["flex-j", "j", "justify-content", SAYS.justify], ["flex-a", "a", "align-items", SAYS.align]]) {
        const ok = F.pick[prop] === F.answer[prop];
        if (!ok) {
          right = false;
          lines.push(`\`${name}\` should be \`${F.answer[prop]}\`, which ${says[F.answer[prop]]}. You picked \`${F.pick[prop]}\`, which ${says[F.pick[prop]]}.`);
        }
        $(id).querySelectorAll("button").forEach(b => {
          b.disabled = true;
          if (b.dataset.value === F.answer[prop]) b.classList.add("good");
          else if (b.dataset.value === F.pick[prop]) b.classList.add("bad");
        });
      }
      if (right) {
        F.score++; F.streak++;
        stats();
        timer = setTimeout(next, DELAY);
        return;
      }
      F.streak = 0;
      stats();
      explain(lines);
      $("flex-next").hidden = false;
    }

    function stop() {
      clearTimeout(timer);
      F = null;
      show("idle");
    }

    $("flex-start").onclick = () => show("pick");
    $("flex-cancel").onclick = () => show("idle");
    document.querySelectorAll("#flex-pick [data-diff]").forEach(b => {
      b.onclick = () => begin(b.dataset.diff);
    });
    $("flex-submit").onclick = submit;
    $("flex-next").onclick = next;
    $("flex-stop").onclick = stop;
  })();
})();
