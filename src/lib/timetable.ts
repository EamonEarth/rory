import { festivalDays, festivalEvents, type FestivalEvent } from "@/data/events";

export const timetableStorageKey = "rory-festival-custom-timetable";

export function normalizeVenue(venue: string) {
  if (venue.includes("Rory Gallagher")) {
    return venue;
  }

  if (venue === "Bridgend Bar" || venue === "The Bridgend Bar") {
    return "Bridgend";
  }

  return venue
    .replace(/^McIntyre's Saloon (Bar|Pub)$/, "McIntyre's")
    .replace(/^Melly's (Bar|Pub)$/, "Melly's")
    .replace(/\s+(Saloon Bar|Saloon Pub|Pub|Bar)$/, "");
}

export const programmeEvents = festivalEvents.filter(
  (event) => event.venue !== "Multiple venues",
);

export function sortEvents(events: FestivalEvent[]) {
  return [...events].sort((a, b) => {
    if (a.day !== b.day) {
      return festivalDays.indexOf(a.day) - festivalDays.indexOf(b.day);
    }

    return a.minutes - b.minutes || a.title.localeCompare(b.title);
  });
}
