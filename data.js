// EDIT THIS FILE to add yourself. Copy a line, change the values, and open a pull request.
// Keep the commas. Put your line just above the "// add new members above" comment.

const club = {
  name: "Notre Dame Coding",
  meetingInfo: "Gold Tuesdays and Wednesdays in the Steam Center"  // TODO: update
};

const members = [
  { name: "Blake Westin", role: "President", note: "Manage the club" },
  { name: "Arie Lee", role: "Vice President", note: "Help manage club" },
  { name: "Masha Poberejsky", role: "Outreach", note: "Run social media" },
  { name: "Jake Gozen", role: "Learning Coordinator", note: "Teach club members" },
  { name: "Gabe Ho", role: "Member", note: "Attend Meetings" },
  { name: "Esa Wendel-Solberg", role: "Member", note: "Attend Meetings" },
  { name: "Jackson Henson", role: "Member", note: "Attend Meetings" },
  { name: "Aliya Sabripour", role: "Member", note: "Attend Meetings"},,
  { name: "Porter Hatfield", role: "Member", note: "Attend Meetings" },
  { name: "Hannah Fuentes", role: "Member", note: "Attend Meetings" },
  { name: "Nolan Grieder", role: "Member", note: "Attend Meetings" },
  { name: "Charlie Williams", role: "Member", note: "Attend Meetings" },
  { name: "Holden Antoon", role: "Member", note: "Attend Meetings" },
  { name: "Finn Sweeeney", role: "Member", note: "Attend Meetings" },
  { name: "Declan Wilson", role: "Member", note: "Attend Meetings" },
  { name: "John Schaubach", role: "Member", note: "Attend Meetings" },
  { name: "Jacob Liezon", role: "Member", note: "Attend Meetings" },
  { name: "Marlon Russel", role: "Member", note: "Attend Meetings" },
  { name: "Daniel Arato", role: "Member", note: "Attend Meetings" },
  { name: "Cormac Skaggs", role: "Member", note: "Attend Meetings" },
  { name: "Nico Piedmont", role: "Member", note: "Attend Meetings" },
  { name: "Ayden Cserkuti", role: "Member", note: "Attend Meetings" },
  { name: "James Renard", role: "Member", note: "Attend Meetings" },
  { name: "Magnus Miklin", role: "Member", note: "Attend Meetings" },
  { name: "Carlos Torres", role: "Member", note: "Attend Meetings" },
  { name: "Noah Gonzalez", role: "Member", note: "Attend Meetings" },
  { name: "Andrew Kim", role: "Member", note: "Attend Meetings" },
  { name: "Alexander Szot", role: "Member", note: "Attend Meetings" },
  { name: "Eva Havanessian", role: "Member", note: "Attend Meetings" },
  { name: "Charles Renard", role: "Member", note: "Attend Meetings" },
  { name: "Eli Billik", role: "Member", note: "Attend Meetings" },
  { name: "Marcus Hwang", role: "Member", note: "Attend Meetings" },
  { name: "Felix Martin", role: "Member", note: "Attend Meetings" },
  { name: "Christian Perez", role: "Member", note: "Attend Meetings" },
  { name: "Selah Boze", role: "Member", note: "Attend Meetings" },
  { name: "Owen Casillas", role: "Member", note: "Attend Meetings" },
  { name: "Matthew Mendez", role: "Member", note: "Attend Meetings" },
  { name: "Ryan Bohmholdt", role: "Member", note: "Attend Meetings" },
  { name: "Violet Eastabrooks", role: "Member", note: "Attend Meetings" },
  { name: "Jerome Abo", role: "Member", note: "Attend Meetings" },
  { name: "Jonathan Gomez", role: "Member", note: "Attend Meetings" },
  { name: "Oliver Taing", role: "Member", note: "Attend Meetings" },
  { name: "Kevin Cantizano", role: "Member", note: "Attend Meetings" },
  { name: "Nico Guerra", role: "Member", note: "Attend Meetings" },
  
  
  // add new members above
];

// Each meeting can teach one concept for the Concepts section:
//   concept: the concept's name
//   learned: what was learned (shown in its dropdown once the meeting's date has passed)
// Put `backticks` around code, like `<h1>`, and it shows up as code on the site.
const meetings = [
  { date: "2026-10-06", title: "Pull Requests", note: "General information about the club will be covered and Members will make a pull request adding themselves to the website",
    concept: "Git & Pull Requests",
    learned: "The club website lives in one shared GitHub repo, so everyone can work on it without overwriting each other. You edited `data.js` to add your own line, committed the change, and opened a pull request: a request to merge your change into the main code. Once an officer reviewed and merged it, your name showed up on the Members wall." },
  { date: "2026-10-14", title: "HTML Basics on CodePen", note: "Club members will learn tags, elements, and attributes by building a small page on CodePen",
    concept: "Tags & Elements",
    learned: "HTML describes what is on a web page. A page is made of elements, and most elements have an opening tag and a closing tag, like `<p>Hello</p>`. Attributes go inside the opening tag and add extra info, like the `href` in `<a href=\"page.html\">`. CodePen let us type HTML and watch the page update right away." },
  { date: "2026-10-20", title: "HTML Structure", note: "Club members will learn headings, links, images, lists, and semantic tags",
    concept: "Page Structure",
    learned: "Headings go from `<h1>` (most important) down to `<h6>`, and `<p>` holds paragraphs. `<a>` makes links, `<img>` shows pictures (`src` is the file, `alt` describes it), and `<ul>` or `<ol>` with `<li>` items make lists. Semantic tags like `<header>`, `<nav>`, `<main>`, and `<footer>` say what each part of the page is for." },
  { date: "2026-10-28", title: "CSS Basics", note: "Club members will learn selectors, colors, and fonts, and link a stylesheet",
    concept: "Selectors & Styles",
    learned: "CSS controls how a page looks. A rule has a selector that picks elements and declarations that style them, like `h1 { color: blue; }`. Selectors can target a tag (`p`), a class (`.card`), or an id (`#title`). A stylesheet is connected with `<link rel=\"stylesheet\" href=\"style.css\">` inside the `<head>`." },
  { date: "2026-11-03", title: "The Box Model", note: "Club members will learn margin, padding, and borders using the browser inspector",
    concept: "Padding, Border & Margin",
    learned: "Every element is a box with four layers: the content, `padding` around the content, a `border`, and `margin` outside the border that pushes other boxes away. Right-click any element and choose Inspect to see the size of each layer in the browser's dev tools." },
  { date: "2026-11-10", title: "Flexbox Layout", note: "Club members will learn rows, columns, and centering, and build a nav bar",
    concept: "Flexbox",
    learned: "`display: flex` lines up an element's children in a row. `justify-content` spaces them out along the row (like `center` or `space-between`), `align-items` lines them up top to bottom, and `gap` adds space between them. We used it to build a nav bar. Practice it in the Flexbox game below." },
  { date: "2026-11-17", title: "Plan Your Website", note: "Club members will sketch a wireframe and set up a repo for their personal site",
    concept: "Wireframes",
    learned: "A wireframe is a quick sketch of a page's layout made before writing any code. Deciding your sections first (like About, Projects, and Contact) makes building much faster. You also set up your own GitHub repo to hold your site." },
  { date: "2026-11-24", title: "Website Build Session", note: "Club members will turn their wireframe into a styled HTML/CSS page",
    concept: "Building in Small Steps",
    learned: "You turned your wireframe into real HTML and CSS: structure first, then style. Making one small change at a time and checking the browser after each one makes mistakes easy to spot, and committing often means you can always go back." },
  // add new meetings above this line
];
