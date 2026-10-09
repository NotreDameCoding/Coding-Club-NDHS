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

function renderMeetings() {
  const list = document.getElementById("meeting-list");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sorted = [...meetings].sort((a, b) => a.date.localeCompare(b.date));
  let nextIdx = sorted.findIndex(m => new Date(m.date + "T12:00:00") >= today);
  if (nextIdx === -1) nextIdx = sorted.length; // every meeting is done
  sorted.forEach((m, i) => {
    const when = new Date(m.date + "T12:00:00");
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

document.title = club.name;
document.querySelector(".brand").textContent = club.name;
document.getElementById("when").textContent = club.meetingInfo;
renderMembers();
renderMeetings();
