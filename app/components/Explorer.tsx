"use client";

import { useState } from "react";
import { ROUTES, CONCEPTS, type RouteItem } from "../data/routes";
import { Sidebar } from "./Sidebar";
import { RoutePanel } from "./RoutePanel";

export function Explorer() {
  const [active, setActive] = useState<RouteItem>(ROUTES[0].items[0]);

  return (
    <div
      style={{
        fontFamily: "var(--font-mono), 'Fira Code', monospace",
        background: "var(--background)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        color: "var(--text-primary)",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            ⬡ Schema → API Explorer
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            Node.js · Express · pg (node-postgres)
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "#334155",
            background: "var(--border)",
            padding: "5px 12px",
            borderRadius: 6,
          }}
        >
          SELECT A ROUTE TO SEE ITS CODE
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar active={active} onSelect={setActive} />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <RoutePanel route={active} />
        </main>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          padding: "10px 20px",
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {CONCEPTS.map(({ term, desc }) => (
          <div key={term} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
            <span
              style={{ fontSize: 10, fontWeight: 700, color: "var(--accent-amber)", whiteSpace: "nowrap" }}
            >
              {term}
            </span>
            <span style={{ fontSize: 10, color: "#334155" }}>— {desc}</span>
          </div>
        ))}
      </footer>
    </div>
  );
}
