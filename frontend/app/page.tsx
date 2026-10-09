
"use client";

import { useMemo, useState } from "react";

const memories = [
  {
    title: "Personal Cloud Memory Engine",
    type: "Project",
    description: "Architecture, ingestion pipeline, and knowledge graph planning.",
    date: "Oct 6, 2026",
    icon: "◈",
    color: "violet",
  },
  {
    title: "Machine Learning Notes",
    type: "Document",
    description: "Label encoding, standard scaling, and model evaluation.",
    date: "Oct 5, 2026",
    icon: "▤",
    color: "blue",
  },
  {
    title: "Stack and Queue Practice",
    type: "Code",
    description: "Monotonic stacks, parentheses, and queue implementations.",
    date: "Oct 5, 2026",
    icon: "</>",
    color: "orange",
  },
  {
    title: "Entrepreneurship Notes",
    type: "Document",
    description: "Entrepreneurial theories and important exam concepts.",
    date: "Sep 27, 2026",
    icon: "▧",
    color: "green",
  },
];

const navigation = [
  { label: "Overview", icon: "⌂" },
  { label: "All memories", icon: "▤" },
  { label: "AI Search", icon: "⌕" },
  { label: "Timeline", icon: "◷" },
  { label: "Knowledge graph", icon: "◎" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Overview");

  const filteredMemories = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return memories;

    return memories.filter((memory) =>
      `${memory.title} ${memory.type} ${memory.description}`
        .toLowerCase()
        .includes(search)
    );
  }, [query]);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-7 md:flex">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold text-white">
              P
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">PCME</h1>
              <p className="text-xs text-slate-500">Personal Memory Engine</p>
            </div>
          </div>

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  activeNav === item.label
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="w-5 text-center text-lg">{item.icon}</span>
                {item.label}
                {item.label === "All memories" && (
                  <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {memories.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-violet-100 bg-violet-50 p-4">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg text-violet-700">
              ✦
            </div>
            <h3 className="text-sm font-semibold">Your memory, connected</h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Find connections across your documents, notes, and code.
            </p>
            <button
              onClick={() => setActiveNav("AI Search")}
              className="mt-3 text-sm font-semibold text-violet-700 hover:text-violet-900"
            >
              Explore AI Search →
            </button>
          </div>

          <button
            onClick={() => setActiveNav("Settings")}
            className="mt-5 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 hover:bg-slate-50"
          >
            <span className="text-lg">⚙</span>
            Settings
          </button>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-500">Workspace / {activeNav}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {activeNav === "Overview" ? "Your memory space" : activeNav}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:w-72 sm:flex-none">
                <span className="text-lg text-slate-400">⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search your memories..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  aria-label="Search memories"
                />
                <span className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-400 sm:inline">
                  /
                </span>
              </label>

              <button
                onClick={() => alert("Upload will be connected to the backend in a later step.")}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                + Add memory
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 p-6 text-white sm:p-8">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-violet-100">
                  YOUR PERSONAL KNOWLEDGE HUB
                </p>
                <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Everything you know, connected.
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
                  Bring your documents, notes, and code together. Search your
                  knowledge and rediscover what you worked on.
                </p>
                <button
                  onClick={() => setActiveNav("AI Search")}
                  className="mt-6 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                >
                  Explore your memories →
                </button>
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h3 className="text-lg font-bold">Workspace overview</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    A snapshot of your personal knowledge base.
                  </p>
                </div>
                <span className="text-xs text-slate-400">Demo data</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Total memories", value: "128", icon: "▤", note: "Across all content" },
                  { label: "Documents", value: "64", icon: "▧", note: "Notes and files" },
                  { label: "Code snippets", value: "32", icon: "</>", note: "Reusable knowledge" },
                  { label: "Connections", value: "246", icon: "◎", note: "Related concepts" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100/60"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-sm font-semibold text-violet-700">
                        {stat.icon}
                      </span>
                    </div>
                    <p className="mt-4 text-3xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Recent memories</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Pick up where you left off.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav("All memories")}
                    className="text-sm font-semibold text-violet-700 hover:text-violet-900"
                  >
                    View all →
                  </button>
                </div>

                <div className="space-y-2">
                  {filteredMemories.length > 0 ? (
                    filteredMemories.map((memory) => (
                      <button
                        key={memory.title}
                        onClick={() => setActiveNav(memory.title)}
                        className="flex w-full items-start gap-4 rounded-xl p-3 text-left transition hover:bg-slate-50"
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            memory.color === "violet"
                              ? "bg-violet-50 text-violet-700"
                              : memory.color === "blue"
                              ? "bg-blue-50 text-blue-700"
                              : memory.color === "orange"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {memory.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {memory.title}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                              {memory.type}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-slate-500">
                            {memory.description}
                          </span>
                          <span className="mt-2 block text-xs text-slate-400">
                            {memory.date}
                          </span>
                        </span>
                        <span className="pt-1 text-slate-400">↗</span>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
                      No memories match “{query}”. Try another search.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <div className="mb-6">
                  <h3 className="font-bold">Memory timeline</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your recent activity, in order.
                  </p>
                </div>

                <div className="space-y-6">
                  {[
                    { date: "OCT 06", title: "PCME project updated", detail: "Project planning and architecture", color: "bg-violet-500" },
                    { date: "OCT 05", title: "Learning notes added", detail: "Machine learning and DSA", color: "bg-blue-500" },
                    { date: "SEP 29", title: "Workspace created", detail: "Personal knowledge project started", color: "bg-emerald-500" },
                  ].map((event, index) => (
                    <div key={event.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className={`mt-1 h-3 w-3 rounded-full ${event.color}`} />
                        {index !== 2 && (
                          <span className="mt-2 w-px flex-1 bg-slate-200" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className="text-xs font-semibold tracking-wider text-slate-400">
                          {event.date}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{event.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{event.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveNav("Timeline")}
                  className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Open full timeline
                </button>
              </section>
            </div>

            <p className="pb-2 text-center text-xs text-slate-400">
              PCME · Personal Cloud Memory Engine · Frontend prototype
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}