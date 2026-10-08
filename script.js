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

function renderMembers() {
  const list = document.getElementById("member-list");
  const roster = members.filter(Boolean); // ignores stray commas in data.js
  const officerColor = {};                // role -> color number, handed out in order
  roster.forEach(m => {
    const item = el("li", "tile");
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
}

function renderMeetings() {
  const list = document.getElementById("meeting-list");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let nextFound = false;
  meetings.forEach(m => {
    const when = new Date(m.date + "T12:00:00");
    const upcoming = when >= today;
    const item = el("li", upcoming ? "" : "past");
    // The first meeting that hasn't happened yet gets an "Up next" tag
    if (upcoming && !nextFound) { item.classList.add("next"); nextFound = true; }
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
}

document.title = club.name;
document.querySelector(".brand").textContent = club.name;
document.getElementById("when").textContent = club.meetingInfo;
renderMembers();
renderMeetings();
