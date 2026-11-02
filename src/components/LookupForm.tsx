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

const LABEL_WIDTH = 10;

function formatLine(label: string, value: string): string {
  return `${(label + ":").padEnd(LABEL_WIDTH, " ")}${value}`;
}

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
        <p className="text-green-400">$ geoip</p>
        <p className="text-zinc-600">
          ────────────────────────────────────────
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <label htmlFor="target" className="text-green-400">
          &gt;
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
          className="flex-1 bg-transparent border-b border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-green-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !target.trim()}
          className="text-green-400 border border-zinc-700 px-3 py-1 hover:border-green-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? "[ ... ]" : "[ lookup ]"}
        </button>
      </form>

      <div className="mt-6 min-h-[16rem] whitespace-pre text-zinc-200 tabular-nums">
        {state.status === "idle" && (
          <p className="text-zinc-600">{"// awaiting input"}</p>
        )}

        {state.status === "loading" && (
          <p className="text-zinc-500">resolving {target.trim()}...</p>
        )}

        {state.status === "error" && (
          <p className="text-red-400">error: {state.message}</p>
        )}

        {state.status === "success" && (
          <ul>
            {FIELD_ORDER.map((key) => {
              const value = state.data[key];
              if (!value) return null;
              return (
                <li key={key}>{formatLine(key, String(value))}</li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
