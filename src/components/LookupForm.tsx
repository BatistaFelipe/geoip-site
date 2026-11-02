"use client";

import { useState, type FormEvent } from "react";
import type { ApiResponse, LookupResult } from "@/lib/types";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: LookupResult }
  | { status: "error"; message: string };

const FIELD_ORDER: ReadonlyArray<keyof LookupResult> = [
  "ip",
  "hostname",
  "city",
  "region",
  "country",
  "loc",
  "org",
  "postal",
  "timezone",
];

export default function LookupForm() {
  const [target, setTarget] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = target.trim();
    if (!trimmed) return;

    setState({ status: "loading" });

    try {
      const response = await fetch(
        `/api/lookup?target=${encodeURIComponent(trimmed)}`,
        { cache: "no-store" },
      );
      const body = (await response.json()) as ApiResponse<LookupResult>;

      if (!body.ok) {
        setState({ status: "error", message: body.error });
        return;
      }
      setState({ status: "success", data: body.data });
    } catch {
      setState({ status: "error", message: "network error" });
    }
  }

  const isLoading = state.status === "loading";

  return (
    <section className="w-full">
      <div className="mb-4">
        <h1 className="text-green-400">$ geoip</h1>
        <div className="border-t border-zinc-700 mt-1" />
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-wrap sm:flex-nowrap items-center gap-2"
      >
        <label htmlFor="target" className="text-green-400">
          <span aria-hidden="true">&gt;</span>
          <span className="sr-only">IP or hostname</span>
        </label>
        <input
          id="target"
          type="text"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder="ip or hostname"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={isLoading}
          aria-invalid={state.status === "error"}
          aria-describedby={
            state.status === "error" ? "lookup-status" : undefined
          }
          className="min-w-0 flex-1 bg-transparent border-b border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-green-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !target.trim()}
          aria-label={isLoading ? "loading" : undefined}
          className="text-green-400 border border-zinc-700 px-3 py-1 hover:border-green-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span aria-hidden={isLoading}>
            {isLoading ? "[ ... ]" : "[ lookup ]"}
          </span>
        </button>
      </form>

      <div
        id="lookup-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-6 min-h-[16rem] text-zinc-200 tabular-nums break-words"
      >
        {state.status === "idle" && (
          <p className="text-zinc-500">{"// awaiting input"}</p>
        )}

        {state.status === "loading" && (
          <p className="text-zinc-400">resolving {target.trim()}...</p>
        )}

        {state.status === "error" && (
          <p className="text-red-400">error: {state.message}</p>
        )}

        {state.status === "success" && (
          <ul className="space-y-1">
            {FIELD_ORDER.map((key) => {
              const value = state.data[key];
              if (!value) return null;
              return (
                <li key={key} className="flex gap-2">
                  <span className="text-zinc-400 shrink-0 w-24 whitespace-nowrap">
                    {key}:
                  </span>
                  <span className="min-w-0 break-words">
                    {String(value)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
