// GIMSUGA Ebonyi State chapter. The only script on the site: it re-checks which meetings are upcoming or
// past using today's date, so the pages stay right between builds. Without it, the build-time order shows.
(function () {
  "use strict";

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function sortMeetings() {
    var now = today();

    // Any meeting: show its agenda while upcoming, its report once past
    document.querySelectorAll("[data-state][data-event-date]").forEach(function (el) {
      el.setAttribute("data-state", el.getAttribute("data-event-date") < now ? "past" : "upcoming");
    });

    // Meetings page: move meetings that have happened since the build into Past, newest first
    var upcoming = document.querySelector("[data-events-upcoming]");
    var past = document.querySelector("[data-events-past]");
    if (upcoming && past) {
      Array.prototype.slice.call(upcoming.querySelectorAll("[data-event-date]"))
        .filter(function (li) { return li.getAttribute("data-event-date") < now; })
        .forEach(function (li) { past.insertBefore(li, past.firstChild); });
      var none = document.querySelector("[data-events-none]");
      if (none) none.hidden = upcoming.children.length > 0;
      var pastNone = document.querySelector("[data-events-past-none]");
      if (pastNone) pastNone.hidden = past.children.length > 0;
    }

    // Home page: the next meeting is the first one from today on
    var next = document.querySelector("[data-next-event]");
    if (next) {
      var items = Array.prototype.slice.call(next.querySelectorAll("[data-event-date]"));
      var found = items.filter(function (el) { return el.getAttribute("data-event-date") >= now; })[0];
      items.forEach(function (el) { el.hidden = el !== found; });
      var noneNext = next.querySelector(".next__none");
      if (noneNext) noneNext.hidden = !!found;
    }
  }

  sortMeetings();
})();
