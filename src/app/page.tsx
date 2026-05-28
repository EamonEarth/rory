"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { festivalCategories, festivalDays } from "@/data/events";
import {
  matchesSearch,
  programmeEvents,
  sortEvents,
  timetableStorageKey,
  uniqueVenues,
} from "@/lib/timetable";

export default function Home() {
  const [search, setSearch] = useState("");
  const [day, setDay] = useState("All");
  const [category, setCategory] = useState("All");
  const [venue, setVenue] = useState("All");
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

  const venues = useMemo(() => uniqueVenues(programmeEvents), []);

  const filteredEvents = useMemo(() => {
    const list = programmeEvents
      .filter((event) => day === "All" || event.day === day)
      .filter((event) => category === "All" || event.category === category)
      .filter((event) => venue === "All" || event.venue === venue)
      .filter((event) => matchesSearch(event, search));

    return sortEvents(list);
  }, [category, day, search, venue]);

  const selectedEvents = useMemo(() => {
    const selectedSet = new Set(selectedIds);

    return sortEvents(programmeEvents.filter((event) => selectedSet.has(event.id)));
  }, [selectedIds]);

  function toggleEvent(eventId: string) {
    setSelectedIds((current) =>
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId],
    );
  }

  function resetFilters() {
    setSearch("");
    setDay("All");
    setCategory("All");
    setVenue("All");
  }

  const filtersActive =
    search.trim().length > 0 || day !== "All" || category !== "All" || venue !== "All";

  return (
    <main className="min-h-screen bg-[#f8f3e9] text-stone-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] bg-stone-950 px-6 py-8 text-white shadow-2xl shadow-stone-300/70 sm:px-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                Rory Gallagher Festival Timetable
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-200">
                Search the programme and make your own timetable.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-white/10 p-4">
                <strong className="block text-3xl">{programmeEvents.length}</strong>
                <span className="text-sm text-stone-300">shows</span>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <strong className="block text-3xl">{venues.length}</strong>
                <span className="text-sm text-stone-300">venues</span>
              </div>
            </div>
          </div>
          <p className="mt-8 text-sm text-stone-500">This is an unofficial app.</p>
          <Link
            href="/timetable"
            className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:bg-white/15 lg:hidden"
          >
            View my timetable
          </Link>
        </div>

        <section className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
            Search
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Band, venue, day, time..."
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base font-normal outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
            Day
            <select
              value={day}
              onChange={(event) => setDay(event.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base font-normal outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option>All</option>
              {festivalDays.map((festivalDay) => (
                <option key={festivalDay}>{festivalDay}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
            Type
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base font-normal outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option>All</option>
              {festivalCategories.map((festivalCategory) => (
                <option key={festivalCategory}>{festivalCategory}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
            Venue
            <select
              value={venue}
              onChange={(event) => setVenue(event.target.value)}
              className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base font-normal outline-none transition focus:border-amber-500 focus:bg-white"
            >
              <option>All</option>
              {venues.map((eventVenue) => (
                <option key={eventVenue}>{eventVenue}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!filtersActive}
            className="self-end rounded-2xl bg-stone-950 px-5 py-3 font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset
          </button>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Programme</h2>
                <p className="text-sm text-stone-600">
                  Showing {filteredEvents.length} of {programmeEvents.length} listings.
                </p>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">
                No matching shows. Try a different search or reset the filters.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEvents.map((event) => {
                  const isSelected = selectedIds.includes(event.id);

                  return (
                    <article
                      key={event.id}
                      className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                              {event.day}
                            </span>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">
                              {event.time}
                            </span>
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-700">
                              {event.category}
                            </span>
                          </div>
                          <h3 className="text-xl font-black">{event.title}</h3>
                          <p className="mt-1 font-semibold text-stone-700">
                            {event.venue} - {event.date}
                          </p>
                          {event.details ? (
                            <p className="mt-3 leading-7 text-stone-600">
                              {event.details}
                            </p>
                          ) : null}
                          {event.ticketInfo ? (
                            <p className="mt-3 text-sm font-bold text-red-700">
                              {event.ticketInfo}
                            </p>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleEvent(event.id)}
                          className={`shrink-0 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                            isSelected
                              ? "bg-amber-400 text-stone-950 hover:bg-amber-300"
                              : "bg-stone-950 text-white hover:bg-stone-800"
                          }`}
                        >
                          {isSelected ? "Remove" : "Add to timetable"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="hidden h-fit rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:block">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">My timetable</h2>
                <p className="text-sm text-stone-600">
                  {selectedEvents.length
                    ? `${selectedEvents.length} saved picks`
                    : "Add events from the programme"}
                </p>
              </div>
              {selectedEvents.length ? (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="rounded-full bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-stone-200"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="space-y-3">
              {selectedEvents.length ? (
                selectedEvents.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-amber-700">
                          {event.day} - {event.time}
                        </p>
                        <h3 className="mt-1 font-black">{event.title}</h3>
                        <p className="mt-1 text-sm text-stone-600">{event.venue}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleEvent(event.id)}
                        aria-label={`Remove ${event.title}`}
                        className="rounded-full bg-white px-3 py-1 text-sm font-black text-stone-700 shadow-sm transition hover:bg-stone-200"
                      >
                        x
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-stone-600">
                  Your saved timetable will appear here.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
