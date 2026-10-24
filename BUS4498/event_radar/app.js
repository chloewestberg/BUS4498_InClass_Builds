// Club Event Radar: the website's code.
// Reads published events from Supabase and sends new announcements to the AI agent.
// All text from posts is shown with textContent, never innerHTML.
(function () {
  "use strict";

  var config = window.EVENT_RADAR_CONFIG || {};
  var COLUMNS = "id, created_at, status, title, club, event_date, start_time, end_time, place_name, place_detail, cost, free_food, summary";
  var AGENT_URL = (config.supabaseUrl || "").replace(/\/+$/, "") + "/functions/v1/submit-event";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  var board = document.getElementById("board");
  var form = document.getElementById("post-form");
  var textarea = document.getElementById("announcement");
  var postButton = document.getElementById("post-button");
  var resultBox = document.getElementById("result");
  var refreshButton = document.getElementById("refresh");
  var chips = document.querySelectorAll(".chip[data-filter]");

  var events = [];
  var filter = "all";
  var db = null;

  if (window.supabase && config.supabaseUrl && config.publishableKey) {
    db = window.supabase.createClient(config.supabaseUrl, config.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // ---------- small helpers ----------
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function todayPacific() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
  }

  function parseDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
  }

  function formatTime(t) {
    var m = /^(\d{1,2}):(\d{2})/.exec(t || "");
    if (!m) return "";
    var h = Number(m[1]);
    var suffix = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + m[2] + " " + suffix;
  }

  function whenLine(ev) {
    var parts = [];
    var d = parseDate(ev.event_date);
    if (d) parts.push(DAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate());
    else parts.push("Date to be announced");
    var start = formatTime(ev.start_time);
    var end = formatTime(ev.end_time);
    if (start && end) parts.push(start + " to " + end);
    else if (start) parts.push(start);
    return parts.join(" · ");
  }

  // ---------- the event list ----------
  function eventCard(ev) {
    var li = el("li", "event");

    var d = parseDate(ev.event_date);
    var date = el("div", d ? "date" : "date tba");
    if (d) {
      date.appendChild(el("span", "mon", MONTHS[d.getMonth()]));
      date.appendChild(el("span", "day", String(d.getDate())));
    } else {
      date.appendChild(el("span", "day", "TBA"));
    }
    li.appendChild(date);

    var body = el("div", "event-body");
    body.appendChild(el("p", "when", whenLine(ev)));
    body.appendChild(el("h3", null, ev.title || "Club event"));

    var place = [ev.place_name, ev.place_detail].filter(Boolean).join(", ");
    var meta = [ev.club, place].filter(Boolean).join(" · ");
    if (meta) body.appendChild(el("p", "meta", meta));
    if (ev.summary) body.appendChild(el("p", "summary", ev.summary));

    var tags = el("p", "tags");
    if (ev.cost) tags.appendChild(el("span", "tag", /^free$/i.test(ev.cost) ? "Free" : ev.cost));
    if (ev.free_food) tags.appendChild(el("span", "tag food", "🍕 Free food"));
    if (tags.childNodes.length) body.appendChild(tags);

    li.appendChild(body);
    return li;
  }

  function renderBoard(message) {
    board.textContent = "";
    if (message) {
      board.appendChild(el("li", "empty", message));
      return;
    }
    var shown = filter === "food" ? events.filter(function (ev) { return ev.free_food; }) : events;
    if (shown.length === 0) {
      board.appendChild(el("li", "empty",
        filter === "food" ? "No free-food events right now." : "No events yet. Post the first one!"));
      return;
    }
    shown.forEach(function (ev) { board.appendChild(eventCard(ev)); });
  }

  function loadEvents() {
    if (!db) {
      renderBoard("The website can’t reach Supabase. Check the Project URL and publishable key in config.js.");
      return Promise.resolve();
    }
    refreshButton.disabled = true;
    return db
      .from("events")
      .select(COLUMNS)
      .eq("status", "published")
      .or("event_date.gte." + todayPacific() + ",event_date.is.null")
      .order("event_date", { ascending: true, nullsFirst: false })
      .order("start_time", { ascending: true, nullsFirst: false })
      .then(function (res) {
        if (res.error) throw res.error;
        events = res.data || [];
        renderBoard();
      })
      .catch(function (err) {
        console.error("Loading events failed:", err);
        renderBoard("Couldn’t load events right now. Try Refresh in a moment.");
      })
      .then(function () { refreshButton.disabled = false; });
  }

  // ---------- the agent's answer ----------
  var LABELS = {
    published: "Published",
    waiting: "Waiting for a moderator",
    rejected: "Not posted",
    duplicate: "Already posted",
    error: "Something went wrong",
  };

  function showResult(kind, message, reasons) {
    resultBox.className = "result " + kind;
    resultBox.textContent = "";
    resultBox.appendChild(el("p", "result-label", LABELS[kind] || LABELS.error));
    if (message) resultBox.appendChild(el("p", null, message));
    if (reasons && reasons.length) {
      var ul = el("ul", "reasons");
      reasons.forEach(function (r) { ul.appendChild(el("li", null, r)); });
      resultBox.appendChild(ul);
    }
    resultBox.hidden = false;
  }

  function sendPost(event) {
    event.preventDefault();
    var text = textarea.value.trim();
    if (!text) {
      showResult("error", "Please type an announcement first.");
      return;
    }
    if (!config.supabaseUrl || !config.publishableKey) {
      showResult("error", "The website isn’t connected to Supabase yet. Check config.js.");
      return;
    }

    var data = new FormData();
    data.append("announcement", text);

    postButton.disabled = true;
    postButton.textContent = "Checking your post…";

    fetch(AGENT_URL, {
      method: "POST",
      headers: { apikey: config.publishableKey },
      body: data,
    })
      .then(function (res) {
        return res.json().catch(function () { return { ok: false, message: "The agent sent an answer the website couldn’t read." }; });
      })
      .then(function (answer) {
        if (!answer || answer.ok !== true) {
          showResult("error", (answer && answer.message) || "The agent didn’t answer. Please try again.");
          return;
        }
        var kind = LABELS[answer.status] ? answer.status : "error";
        showResult(kind, answer.message, answer.reasons);
        if (answer.status === "published") {
          textarea.value = "";
          loadEvents();
        }
      })
      .catch(function (err) {
        console.error("Posting failed:", err);
        showResult("error", "Couldn’t reach the agent. Check your connection and try again.");
      })
      .then(function () {
        postButton.disabled = false;
        postButton.textContent = "Post event";
      });
  }

  // ---------- wire it up ----------
  form.addEventListener("submit", sendPost);
  refreshButton.addEventListener("click", loadEvents);
  Array.prototype.forEach.call(chips, function (chip) {
    chip.addEventListener("click", function () {
      filter = chip.getAttribute("data-filter");
      Array.prototype.forEach.call(chips, function (c) {
        c.setAttribute("aria-pressed", c === chip ? "true" : "false");
      });
      renderBoard();
    });
  });

  loadEvents();
})();
