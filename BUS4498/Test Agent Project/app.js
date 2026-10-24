const state = { icons: [], matches: [], lastQuery: "" };
const $ = (selector) => document.querySelector(selector);

function iconCard(icon, { entering = false, index = 0 } = {}) {
  const card = document.createElement("article");
  card.className = `icon-card${entering ? " is-entering" : ""}`;
  card.style.setProperty("--i", index);
  card.dataset.iconId = icon.id;
  card.title = `${icon.name} — ${icon.description}`;
  card.innerHTML = `<span class="emoji" aria-hidden="true">${icon.emoji}</span><span class="icon-name">${icon.name}</span>`;
  return card;
}

function renderCollection() {
  const collection = $("#collection");
  collection.replaceChildren();
  state.icons.filter((icon) => !state.matches.includes(icon.id)).forEach((icon) => collection.appendChild(iconCard(icon)));
  $("#collection-count").textContent = state.icons.length - state.matches.length;
}

function renderCrate({ animate = false } = {}) {
  const crate = $("#crate-items");
  crate.replaceChildren();
  const matches = state.matches.map((id) => state.icons.find((icon) => icon.id === id)).filter(Boolean);
  if (!matches.length) {
    crate.innerHTML = `<div class="empty-crate"><span class="empty-icon">✧</span><span>your crate is waiting</span><small>Search for a feeling to fill it up</small></div>`;
  } else {
    matches.forEach((icon, index) => crate.appendChild(iconCard(icon, { entering: animate, index })));
  }
  $("#crate-count").textContent = `${matches.length} inside`;
}

function setStatus(message = "", tone = "") {
  const status = $("#status-message");
  status.textContent = message;
  status.className = `status-message${tone ? ` is-${tone}` : ""}`;
}

function setLoading(isLoading) {
  document.body.classList.toggle("is-loading", isLoading);
  const button = $("#search-button");
  button.disabled = isLoading;
  button.querySelector("span:first-child").textContent = isLoading ? "Sorting…" : "Search";
}

async function search(keyword) {
  const query = keyword.trim();
  if (!query) {
    setStatus("Type a keyword to wake up the crate.", "warning");
    $("#keyword").focus();
    return;
  }
  state.lastQuery = query;
  setLoading(true);
  setStatus(`Looking for ${query.toLowerCase()} little things…`);
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: query, icons: state.icons.map(({ id, description, tags }) => ({ id, description, tags })) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The local server could not sort the collection.");
    state.matches = Array.isArray(data.ids) ? data.ids.filter((id) => state.icons.some((icon) => icon.id === id)) : [];
    renderCollection();
    renderCrate({ animate: true });
    if (data.mode === "fallback") {
      setStatus(data.message || "Claude is not configured yet — showing local keyword matching.", data.error ? "error" : "warning");
      $("#mode-label").textContent = "Local keyword fallback";
      $("#model-label").textContent = "Local fallback";
    } else {
      setStatus(state.matches.length ? `${state.matches.length} found for “${query}”.` : `No close matches for “${query}” — try another little word.`, state.matches.length ? "" : "warning");
      $("#mode-label").textContent = "Claude-powered · local server";
      $("#model-label").textContent = "Claude sorter";
    }
  } catch (error) {
    state.matches = [];
    renderCollection();
    renderCrate();
    setStatus(error.message || "Something went wrong while sorting. Please try again.", "error");
  } finally {
    setLoading(false);
  }
}

async function init() {
  try {
    const response = await fetch("/icons.json");
    if (!response.ok) throw new Error("Could not load the local icon catalog.");
    state.icons = await response.json();
    renderCollection();
  } catch (error) {
    setStatus(error.message, "error");
  }
  $("#search-form").addEventListener("submit", (event) => { event.preventDefault(); search($("#keyword").value); });
  document.querySelectorAll("[data-suggestion]").forEach((button) => button.addEventListener("click", () => { $("#keyword").value = button.dataset.suggestion; search(button.dataset.suggestion); }));
}

init();
