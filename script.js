// Loads levels.json (an array of objects) and renders the ranked list.
// Each object: { "Level Name": "...", "Level Creator": "...", "Video ID": "YouTubeID" }
// "Video ID" is the part after v= in a YouTube URL; it powers the thumbnail and link.

const list = document.getElementById("list");
const statusBox = document.getElementById("status");
const MAX_ITEMS = 150;

// Theme toggle
document.getElementById("theme").addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// Fade in when an item enters the viewport, fade out when it leaves
const observer = new IntersectionObserver((entries) => {
  for (const e of entries) e.target.classList.toggle("visible", e.isIntersecting);
}, { rootMargin: "-4% 0px -4% 0px", threshold: 0.05 });

function showStatus(msg) { statusBox.textContent = msg; statusBox.hidden = false; }

function buildItem(level, index) {
  const name = level["Level Name"] ?? "Untitled";
  const creator = level["Level Creator"] ?? "Unknown";
  const id = level["Video ID"];
  const url = id
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(name + " " + creator)}`;

  const li = document.createElement("li");
  li.className = "item glass";

  const a = document.createElement("a");
  a.className = "thumb";
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", `Watch ${name} on YouTube`);

  if (id) {
    const img = document.createElement("img");
    img.src = `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg`;
    img.alt = `Thumbnail for ${name}`;
    img.loading = "lazy";
    a.append(img);
  }

  const info = document.createElement("div");
  info.className = "info";
  const title = document.createElement("h2");
  title.className = "title";
  title.textContent = `#${index + 1} - ${name}`;
  const by = document.createElement("p");
  by.className = "creator";
  by.textContent = creator;
  info.append(title, by);

  li.append(a, info);
  return li;
}

fetch("levels.json")
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => {
    if (!Array.isArray(data) || !data.length) { showStatus("levels.json has no levels yet. Add entries and reload."); return; }
    data.slice(0, MAX_ITEMS).forEach((level, i) => {
      const li = buildItem(level, i);
      list.append(li);
      observer.observe(li);
    });
  })
  .catch((err) => showStatus(`Couldn't load levels.json (${err.message}). Check that it sits next to index.html and is valid JSON.`));
