import { festivalDays, festivalEvents, type FestivalEvent } from "@/data/events";

export const timetableStorageKey = "rory-festival-custom-timetable";

export const programmeEvents: FestivalEvent[] = festivalEvents;

export function sortEvents(events: FestivalEvent[]): FestivalEvent[] {
  return [...events].sort((a, b) => {
    if (a.day !== b.day) {
      return festivalDays.indexOf(a.day) - festivalDays.indexOf(b.day);
    }

    return a.minutes - b.minutes || a.title.localeCompare(b.title);
  });
}

function normaliseText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2018\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function timeAliases(time: string): string[] {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return [];
  }

  const [, hour, minute, period] = match;
  const periodLower = period.toLowerCase();
  const aliases = [`${hour}${minute}${periodLower}`];

  if (minute === "00") {
    aliases.push(`${hour}${periodLower}`);

    if (hour === "12" && periodLower === "pm") {
      aliases.push("noon");
    }
  }

  return aliases;
}

function eventSearchTokens(event: FestivalEvent): string {
  return normaliseText(
    [
      event.title,
      event.venue,
      event.day,
      event.date,
      event.category,
      event.time,
      ...timeAliases(event.time),
      event.details ?? "",
      event.ticketInfo ?? "",
    ].join(" "),
  );
}

export function matchesSearch(event: FestivalEvent, query: string): boolean {
  const tokens = normaliseText(query).split(" ").filter(Boolean);

  if (!tokens.length) {
    return true;
  }

  const haystack = eventSearchTokens(event);

  return tokens.every((token) => haystack.includes(token));
}

export function uniqueVenues(events: FestivalEvent[]): string[] {
  return Array.from(new Set(events.map((event) => event.venue))).sort((a, b) =>
    a.localeCompare(b),
  );
}
