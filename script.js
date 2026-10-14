// Builds the page from the data in data.js. textContent keeps user-entered text safe.

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map(part => part[0].toUpperCase()).join("");
}

// Roles with no special color: plain members and the inside jokes
const PLAIN_ROLES = ["member", "emperor", "philosopher"];
const OFFICER_COLORS = 6; // officer-0 to officer-5 in style.css

const roleOf = m => (m.role || "").trim().toLowerCase();
const isOfficer = m => roleOf(m) !== "" && !PLAIN_ROLES.includes(roleOf(m));
const roster = members.filter(Boolean); // ignores stray commas in data.js

function renderMembers() {
  const list = document.getElementById("member-list");
  const officerColor = {};                // role -> color number, handed out in order
  roster.forEach((m, i) => {
    const item = el("li", "tile tone-" + (i % 4));
    const role = roleOf(m);
    if (isOfficer(m)) {
      if (!(role in officerColor)) officerColor[role] = Object.keys(officerColor).length;
      item.classList.add("officer", "officer-" + (officerColor[role] % OFFICER_COLORS));
    }
    item.append(el("span", "avatar", initials(m.name)));
    const body = el("div");
    body.append(el("strong", "", m.name));
    if (m.role) body.append(el("span", "role", m.role));
    if (m.note) body.append(el("p", "", m.note));
    item.append(body);
    list.append(item);
  });
  document.getElementById("member-count").textContent = roster.length;
}

// A meeting counts as done starting the day after its date.
function meetingDay(m) { return new Date(m.date + "T12:00:00"); }
function isDone(m) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return meetingDay(m) < today;
}
const byDate = (a, b) => a.date.localeCompare(b.date);

function renderMeetings() {
  const list = document.getElementById("meeting-list");
  const sorted = [...meetings].sort(byDate);
  let nextIdx = sorted.findIndex(m => !isDone(m));
  if (nextIdx === -1) nextIdx = sorted.length; // every meeting is done
  sorted.forEach((m, i) => {
    const when = meetingDay(m);
    const item = el("li", i < nextIdx ? "past" : "");
    if (i === nextIdx) item.classList.add("next"); // the first meeting that hasn't happened yet
    const stamp = el("time", "stamp");
    stamp.dateTime = m.date;
    stamp.append(
      el("span", "mo", when.toLocaleDateString(undefined, { month: "short" })),
      el("span", "day", String(when.getDate()))
    );
    item.append(stamp);
    const body = el("div");
    body.append(el("strong", "", m.title));
    if (m.note) body.append(el("p", "", m.note));
    item.append(body);
    list.append(item);
  });
  setupPastToggle(list, nextIdx);
}

// Past meetings are hidden at first. A dashed card at the top of the list,
// right where they would be, shows or hides them.
function setupPastToggle(list, pastCount) {
  if (pastCount === 0) return;
  list.classList.add("hide-past");
  const item = el("li", "past-toggle");
  const button = el("button");
  button.type = "button";
  button.setAttribute("aria-controls", "meeting-list");
  button.setAttribute("aria-expanded", "false");
  const label = shown => (shown ? "Hide past meetings" : `Show ${pastCount} past meeting${pastCount === 1 ? "" : "s"}`);
  button.append(el("span", "pt-arrow"), el("span", "pt-label", label(false)));
  button.addEventListener("click", () => {
    const shown = !list.classList.toggle("hide-past");
    button.setAttribute("aria-expanded", String(shown));
    button.querySelector(".pt-label").textContent = label(shown);
  });
  item.append(button);
  list.prepend(item);
}

// Turns `backtick` parts of a sentence into <code>, safely (no innerHTML).
function withCode(tag, text) {
  const node = el(tag);
  String(text).split("`").forEach((part, i) => {
    if (part) node.append(i % 2 ? el("code", "", part) : document.createTextNode(part));
  });
  return node;
}

function renderConcepts() {
  const list = document.getElementById("concept-list");
  const taught = [...meetings].filter(m => m.concept).sort(byDate);
  const learnedCount = taught.filter(isDone).length;
  taught.forEach((m, i) => {
    const learned = i < learnedCount;
    const item = el("li", learned ? "learned" : "locked");
    // Concept name ------- meeting it was learned in
    const head = el("span", "c-head");
    const when = meetingDay(m).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const meeting = el("span", "c-meeting", m.title);
    meeting.append(el("span", "c-date", when));
    head.append(el("span", "c-name", m.concept), el("span", "c-lead"), meeting);

    if (learned) {
      // Click to open: <details> is a built-in dropdown that works with the keyboard too
      const box = el("details");
      const summary = el("summary");
      summary.append(head, el("span", "c-arrow"));
      box.append(summary, withCode("p", m.learned || "Notes for this concept are coming soon."));
      item.append(box);
    } else {
      const row = el("div", "c-row");
      row.append(head, el("span", "c-tag", "Concept not learned"));
      item.append(row);
    }
    list.append(item);
  });
}

document.title = club.name;
document.querySelector(".brand").textContent = club.name;
document.getElementById("when").textContent = club.meetingInfo;
// Home tab: one preview card per section
const plural = (n, word) => n + " " + word + (n === 1 ? "" : "s");

function renderHome() {
  const sorted = [...meetings].sort(byDate);
  const next = sorted.find(m => !isDone(m));
  const learned = sorted.filter(m => m.concept && isDone(m));
  const officers = roster.filter(isOfficer).length;
  const cards = [
    { tab: "meetings", title: "Meetings", preview: next ? "Next meeting: " + next.title : "No meetings scheduled yet", go: "See all meetings" },
    { tab: "concepts", title: "Concepts", preview: learned.length ? `${learned.length} learned · latest: ${learned[learned.length - 1].concept}` : "First concept coming soon", go: "Review concepts" },
    { tab: "games", title: "Coding Games", preview: "Test your coding knowledge", go: "Play a game" },
    { tab: "members", title: "Members", preview: `${plural(officers, "Officer")} · ${plural(roster.length - officers, "Member")}`, go: "Meet the club" }
  ];
  const box = document.getElementById("home-cards");
  cards.forEach(c => {
    const card = el("a", "home-card");
    card.href = "#" + c.tab;
    card.append(el("h3", "", c.title), el("p", "", c.preview), el("span", "go", c.go + " →"));
    box.append(card);
  });
}

// Tabs: show one section at a time. The address bar keeps the tab (#games),
// so links and the Back button work, without jumping the page around.
const TABS = ["home", "meetings", "concepts", "games", "members"];

function setupTabs() {
  const bar = document.querySelector(".tabbar");
  const tabFor = id => document.getElementById("tab-" + id);
  const fromHash = () => {
    const id = location.hash.slice(1);
    return TABS.includes(id) ? id : "home";
  };

  function show(id) {
    TABS.forEach(t => {
      const on = t === id;
      document.getElementById(t).hidden = !on;
      tabFor(t).setAttribute("aria-selected", String(on));
      tabFor(t).tabIndex = on ? 0 : -1;
    });
    // If the tabs are scrolled off the top, bring them back into view
    if (bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ block: "start" });
  }

  function open(id) {
    if (fromHash() !== id) history.pushState(null, "", "#" + id);
    show(id);
  }

  bar.addEventListener("click", e => {
    const tab = e.target.closest("[data-tab]");
    if (tab) open(tab.dataset.tab);
  });
  // Left and right arrow keys move between tabs
  bar.addEventListener("keydown", e => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (!step) return;
    const i = TABS.indexOf(fromHash());
    const id = TABS[(i + step + TABS.length) % TABS.length];
    open(id);
    tabFor(id).focus();
    e.preventDefault();
  });
  // Home cards and the club name are links to tabs
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href").slice(1);
      if (!TABS.includes(id)) return;
      e.preventDefault();
      open(id);
      if (a.classList.contains("brand")) window.scrollTo(0, 0);
    });
  });
  window.addEventListener("popstate", () => show(fromHash()));
  show(fromHash());
  // A link like .../#games opens that tab at the top of the page
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const toTop = () => window.scrollTo({ top: 0, behavior: "instant" });
  if (location.hash) { toTop(); window.addEventListener("load", () => requestAnimationFrame(toTop)); }
}

renderMeetings();
renderConcepts();
renderMembers();
renderHome();
setupTabs();
