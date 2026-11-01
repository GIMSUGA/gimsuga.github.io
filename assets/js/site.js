// GIMSUGA Ebonyi State chapter. The only script on the site: it re-checks which meetings are upcoming or
// past, and the next first Sunday, using today's date, so the pages stay right between builds. Without it,
// the build-time dates show.
(function () {
  "use strict";

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function isoOf(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function longLabel(d) { return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
  function shortLabel(d) { return DAYS[d.getDay()].slice(0, 3) + " " + d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) + " " + d.getFullYear(); }

  // Dates an officer marked Cancelled (layouts/_partials/meetings-cancelled.html)
  function cancelledDates() {
    return (document.body.getAttribute("data-cancelled") || "").split(" ").filter(Boolean);
  }

  // The first Sunday of month m (0-11, may run past either end of the year)
  function sundayOf(y, m) {
    var first = new Date(y, m, 1);
    return new Date(first.getFullYear(), first.getMonth(), 1 + (7 - first.getDay()) % 7);
  }

  // The next first Sunday from today (today included), skipping cancelled ones
  function firstSunday(now, cancelled) {
    var y = +now.slice(0, 4), m = +now.slice(5, 7) - 1;
    for (var add = 0; add < 6; add++) {
      var d = sundayOf(y, m + add), iso = isoOf(d);
      if (iso >= now && cancelled.indexOf(iso) < 0) return d;
    }
    return null;
  }

  // The most recent first Sunday before today that was not cancelled: the last monthly general meeting
  function lastFirstSunday(now, cancelled) {
    var y = +now.slice(0, 4), m = +now.slice(5, 7) - 1;
    for (var add = 0; add > -6; add--) {
      var d = sundayOf(y, m + add), iso = isoOf(d);
      if (iso < now && cancelled.indexOf(iso) < 0) return d;
    }
    return null;
  }

  function sortMeetings() {
    var now = today();
    var cancelled = cancelledDates();
    var fs = firstSunday(now, cancelled);
    var fsIso = fs ? isoOf(fs) : "";

    // Any meeting: show its agenda while upcoming, its report once past
    document.querySelectorAll("[data-state][data-event-date]").forEach(function (el) {
      el.setAttribute("data-state", el.getAttribute("data-event-date") < now ? "past" : "upcoming");
    });

    // Meetings page: move meetings that have happened since the build into Past, into their year's
    // group (made if needed), newest first. The newest year stays open; earlier years fold away.
    var upcoming = document.querySelector("[data-events-upcoming]");
    var past = document.querySelector("[data-events-past]");
    if (upcoming && past) {
      Array.prototype.slice.call(upcoming.querySelectorAll("[data-event-date]"))
        .filter(function (li) { return li.getAttribute("data-event-date") < now; })
        .forEach(function (li) {
          // A cancelled meeting drops off once its date has passed
          if (li.hasAttribute("data-cancelled")) { li.parentNode.removeChild(li); return; }
          var year = li.getAttribute("data-event-date").slice(0, 4);
          var group = past.querySelector('[data-year="' + year + '"]');
          if (!group) {
            group = document.createElement("details");
            group.className = "year";
            group.setAttribute("data-year", year);
            group.innerHTML = '<summary><span class="year__label">' + year + '</span> <span class="year__count muted" data-year-count></span></summary><ul class="events events--past"></ul>';
            var later = Array.prototype.slice.call(past.querySelectorAll("[data-year]"))
              .filter(function (g) { return g.getAttribute("data-year") < year; })[0];
            past.insertBefore(group, later || null);
          }
          var list = group.querySelector("ul");
          list.insertBefore(li, list.firstChild);
        });
      var groups = Array.prototype.slice.call(past.querySelectorAll("[data-year]"));
      groups.forEach(function (g, i) {
        var n = g.querySelectorAll("[data-event-date]").length;
        g.querySelector("[data-year-count]").textContent = n + (n === 1 ? " meeting" : " meetings");
        if (i === 0) g.open = true;
      });
      // "The next monthly general meeting is on ..." unless an officer-added meeting (not cancelled) comes first
      var none = document.querySelector("[data-events-none]");
      if (none) {
        none.hidden = Array.prototype.slice.call(upcoming.querySelectorAll("[data-event-date]")).some(function (li) {
          return !li.hasAttribute("data-cancelled") && li.getAttribute("data-event-date") <= fsIso;
        });
      }

      // The last monthly general meeting, unless an officer added that meeting themselves
      var last = document.querySelector("[data-last-meeting]");
      if (last) {
        var ld = lastFirstSunday(now, cancelled);
        if (ld) {
          var lIso = isoOf(ld);
          last.setAttribute("data-last-meeting", lIso);
          last.querySelector("[data-last-day]").textContent = ld.getDate();
          last.querySelector("[data-last-month]").textContent = MONTHS[ld.getMonth()].slice(0, 3);
          var t = last.querySelector("[data-last-date]");
          t.setAttribute("datetime", lIso);
          t.textContent = shortLabel(ld);
          last.hidden = !!past.querySelector('[data-event-date="' + lIso + '"]');
        } else {
          last.hidden = true;
        }
      }
      var pastNone = document.querySelector("[data-events-past-none]");
      if (pastNone) pastNone.hidden = groups.length > 0 || (last && !last.hidden);
    }

    // The next first Sunday of a month (the chapter's usual meeting day), wherever the site shows it
    if (fs) {
      document.querySelectorAll("[data-first-sunday-date]").forEach(function (el) {
        el.setAttribute("datetime", fsIso);
        el.textContent = longLabel(fs);
      });
      var autoToday = document.querySelector("[data-first-sunday] [data-today]");
      if (autoToday) autoToday.setAttribute("data-today", fsIso);
    }

    // Home page: the first meeting an officer added from today on, if it is no later than the next first
    // Sunday; otherwise the next first Sunday itself
    var next = document.querySelector("[data-next-event]");
    if (next) {
      var items = Array.prototype.slice.call(next.querySelectorAll("[data-event-date]"));
      var found = items.filter(function (el) { return el.getAttribute("data-event-date") >= now; })[0];
      if (found && found.getAttribute("data-event-date") > fsIso) found = null;
      items.forEach(function (el) { el.hidden = el !== found; });
      var auto = next.querySelector("[data-first-sunday]");
      if (auto) auto.hidden = !!found;
    }
  }

  // Join page: a button that copies the ready-made message (shown only where copying works)
  var copy = document.querySelector("[data-copy]");
  if (copy && navigator.clipboard && window.isSecureContext) {
    copy.hidden = false;
    copy.addEventListener("click", function () {
      navigator.clipboard.writeText(copy.getAttribute("data-copy-text")).then(function () {
        copy.textContent = "Copied. Paste it into an email";
      });
    });
  }

  sortMeetings();

  // "Today" on a meeting whose date is today
  var now = today();
  document.querySelectorAll("[data-today]").forEach(function (el) {
    el.hidden = el.getAttribute("data-today") !== now;
  });
})();
