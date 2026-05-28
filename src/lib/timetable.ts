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

const PERFORMER_OVERRIDES: Record<string, string[]> = {
  "thu-1830-theatre-opening": [],
  "thu-1900-theatre-legacy-gig": ["Taj Farrant", "Zac Schulze Gang"],
  "fri-1200-statue-peter-price-coldshot": ["Peter Price", "Coldshot Big Band"],
  "fri-1400-rock-hall-impact": ["Crest of a Wave"],
  "sat-1230-theatre-symposium": [],
  "sat-1600-mcginleys-sean-long-jam": ["Sean Long"],
  "sun-1200-bridgend-guitar-session": ["Mark Black", "David Hawkins"],
  "sun-1230-owen-roe-tribute": ["Aiden Pryor", "Whisky Flowers"],
  "sun-1300-mellys-masterclass": ["Peter Price"],
  "sun-1600-lantern-sean-long-jam": ["Sean Long"],
  "sun-2215-bigtop-all-star": [
    "Rory Gallagher All-Star Band",
    "Gerry McAvoy",
    "Brendan O'Neill",
    "Mark Feltham",
    "Pat McManus",
    "Johnny Gallagher",
    "Grainne Duffy",
    "Riki Massini",
    "Seamie O'Dowd",
    "Davy K",
    "Zac Schulze Gang",
  ],
};

const PERFORMER_PATTERNS: Array<[RegExp, string[]]> = [
  [/^Aiden Pryor( & (The )?Whisk(e)?y Flowers)?$/i, ["Aiden Pryor", "Whisky Flowers"]],
  [/^Aiden Pryor Band$/i, ["Aiden Pryor"]],
  [/^Whisk(e)?y Flowers$/i, ["Whisky Flowers"]],
  [/^Mark Black( & Friends| Band)?$/i, ["Mark Black"]],
  [/^Sean Long Band( \(Cork\))?$/i, ["Sean Long"]],
  [/^Davy K( Band| Project)?$/i, ["Davy K"]],
  [/^Davy K - (The )?Solo Show$/i, ["Davy K"]],
  [/^Banshee( \(Belfast\)| Band)?$/i, ["Banshee"]],
  [/^Coldshot (Big|Blues Big) Band$/i, ["Coldshot Big Band"]],
  [/^Peter Price.*$/i, ["Peter Price"]],
  [/^Big Blues Jam - Sean Long.*$/i, ["Sean Long"]],
  [/^Blues Guitar Masterclass with Peter Price$/i, ["Peter Price"]],
  [/^Stoney & The Dogs$/i, ["Stoney & The Dogs"]],
  [/^Johnny Gallagher.*$/i, ["Johnny Gallagher"]],
  [/^Jack Austin Despy( Band)?$/i, ["Jack Austin Despy"]],
  [/^Seamie O'Dowd( Band)?$/i, ["Seamie O'Dowd"]],
  [/^Ciaran Hodgins Band.*$/i, ["Ciaran Hodgins"]],
  [/^Pat McManus Band$/i, ["Pat McManus"]],
  [/^Crest of [aA] Wave$/i, ["Crest of a Wave"]],
  [/^Clara Rose( Band| Big Band)?$/i, ["Clara Rose"]],
  [/^Sean Brennan & The Bullfrog's?$/i, ["Sean Brennan & The Bullfrogs"]],
  [/^Barry McGivern Band$/i, ["Barry McGivern"]],
  [/^Simone Galassi Band$/i, ["Simone Galassi"]],
  [/^Grainne Duffy Band$/i, ["Grainne Duffy"]],
  [/^Paul Sherry Band$/i, ["Paul Sherry"]],
  [/^(The )?Zac Schulze Gang( Unplugged)?$/i, ["Zac Schulze Gang"]],
  [/^Billy F\. Gibbons.*$/i, ["Billy F. Gibbons"]],
  [/^Rory O'Dowd & Friends$/i, ["Rory O'Dowd"]],
  [/^The Stingin' King.*$/i, ["The Stingin' Kings"]],
  [/^Mark Black Band$/i, ["Mark Black"]],
  [/^Stephen Brennan.*$/i, ["Stephen Brennan"]],
];

export function getPerformers(event: FestivalEvent): string[] {
  const override = PERFORMER_OVERRIDES[event.id];

  if (override !== undefined) {
    return override;
  }

  for (const [pattern, performers] of PERFORMER_PATTERNS) {
    if (pattern.test(event.title)) {
      return performers;
    }
  }

  return [event.title];
}

const PERFORMER_SEARCH_ALIASES: Record<string, string[]> = {
  "Davy K": ["Davy Knowles"],
};

function performerSearchAliases(performers: string[]): string[] {
  const aliases: string[] = [];

  for (const performer of performers) {
    const extra = PERFORMER_SEARCH_ALIASES[performer];

    if (extra) {
      aliases.push(...extra);
    }
  }

  return aliases;
}

export function uniquePerformers(events: FestivalEvent[]): string[] {
  const set = new Set<string>();

  for (const event of events) {
    for (const performer of getPerformers(event)) {
      if (performer) {
        set.add(performer);
      }
    }
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
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
  const performers = getPerformers(event);

  return normaliseText(
    [
      event.title,
      event.venue,
      event.day,
      event.date,
      event.category,
      event.time,
      ...timeAliases(event.time),
      ...performers,
      ...performerSearchAliases(performers),
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
