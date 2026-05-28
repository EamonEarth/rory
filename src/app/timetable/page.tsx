"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  normalizeVenue,
  programmeEvents,
  sortEvents,
  timetableStorageKey,
} from "@/lib/timetable";

export default function TimetablePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = window.localStorage.getItem(timetableStorageKey);

    return saved ? (JSON.parse(saved) as string[]) : [];
  });

  useEffect(() => {
    window.localStorage.setItem(timetableStorageKey, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const selectedEvents = useMemo(() => {
    const selectedSet = new Set(selectedIds);

    return sortEvents(programmeEvents.filter((event) => selectedSet.has(event.id)));
  }, [selectedIds]);

  function removeEvent(eventId: string) {
    setSelectedIds((current) => current.filter((id) => id !== eventId));
  }

  return (
    <main className="min-h-screen bg-[#f8f3e9] px-5 py-6 text-stone-950">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <Link
          href="/"
          className="w-fit rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm"
        >
          Back to programme
        </Link>

        <div className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white shadow-xl shadow-stone-300/70">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
            My picks
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">My timetable</h1>
          <p className="mt-3 text-stone-300">
            {selectedEvents.length
              ? `${selectedEvents.length} saved show${selectedEvents.length === 1 ? "" : "s"}`
              : "Your saved timetable is empty."}
          </p>
        </div>

        <div className="space-y-3">
          {selectedEvents.length ? (
            selectedEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                      {event.day} - {event.time}
                    </p>
                    <h2 className="mt-2 text-xl font-black">{event.title}</h2>
                    <p className="mt-1 font-semibold text-stone-700">
                      {normalizeVenue(event.venue)} - {event.date}
                    </p>
                    {event.details ? (
                      <p className="mt-3 leading-7 text-stone-600">{event.details}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEvent(event.id)}
                    aria-label={`Remove ${event.title}`}
                    className="rounded-full bg-stone-100 px-3 py-1 text-sm font-black text-stone-700"
                  >
                    x
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">
              Add shows from the main programme and they will appear here.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
