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
const MEMBERS_SHOWN = 9;  // first three rows; the rest sit behind "Show more"

// Items marked "extra" stay hidden until the button is pressed.
// The button only appears if something is actually hidden.
function setupToggle(list, button, section) {
  if (!list.querySelector(".extra")) return;
  list.classList.add("collapsed");
  button.hidden = false;
  button.addEventListener("click", () => {
    const collapsed = list.classList.toggle("collapsed");
    button.textContent = collapsed ? "Show more" : "Show less";
    button.setAttribute("aria-expanded", String(!collapsed));
    if (collapsed) section.scrollIntoView({ block: "start" }); // back to the top of the list
  });
}

function renderMembers() {
  const list = document.getElementById("member-list");
  const roster = members.filter(Boolean); // ignores stray commas in data.js
  const officerColor = {};                // role -> color number, handed out in order
  roster.forEach((m, i) => {
    const item = el("li", "tile tone-" + (i % 4));
    if (i >= MEMBERS_SHOWN) item.classList.add("extra");
    const role = (m.role || "").trim().toLowerCase();
    if (role && !PLAIN_ROLES.includes(role)) {
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
  setupToggle(list, document.getElementById("members-toggle"), document.getElementById("members"));
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
    // Collapsed view: the last completed meeting, the next one, and the one after that
    if (i < nextIdx - 1 || i > nextIdx + 1) item.classList.add("extra");
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
  setupToggle(list, document.getElementById("meetings-toggle"), document.getElementById("meetings"));
}

// Turns `backtick` parts of a sentence into <code>, safely (no innerHTML).
function withCode(tag, text) {
  const node = el(tag);
  String(text).split("`").forEach((part, i) => {
    if (part) node.append(i % 2 ? el("code", "", part) : document.createTextNode(part));
  });
  return node;
}

// Collapsed view: the most recent learned concepts and the next ones coming up
const CONCEPTS_LEARNED_SHOWN = 3;
const CONCEPTS_UPCOMING_SHOWN = 2;

function renderConcepts() {
  const list = document.getElementById("concept-list");
  const taught = [...meetings].filter(m => m.concept).sort(byDate);
  const learnedCount = taught.filter(isDone).length;
  taught.forEach((m, i) => {
    const learned = i < learnedCount;
    const item = el("li", learned ? "learned" : "locked");
    if (learned ? i < learnedCount - CONCEPTS_LEARNED_SHOWN : i >= learnedCount + CONCEPTS_UPCOMING_SHOWN) {
      item.classList.add("extra");
    }
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
  setupToggle(list, document.getElementById("concepts-toggle"), document.getElementById("concepts"));
}

document.title = club.name;
document.querySelector(".brand").textContent = club.name;
document.getElementById("when").textContent = club.meetingInfo;
renderMeetings();
renderConcepts();
renderMembers();
