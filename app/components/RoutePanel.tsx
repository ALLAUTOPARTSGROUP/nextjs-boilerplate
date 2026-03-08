"use client";

import { useState } from "react";
import { METHOD_COLOR, TABLE_COLOR, type RouteItem } from "../data/routes";
import { CodeBlock } from "./CodeBlock";

export function RoutePanel({ route }: { route: RouteItem }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(route.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const methodColor = METHOD_COLOR[route.method] ?? "#94A3B8";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Route info bar */}
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: methodColor,
            background: `${methodColor}22`,
            padding: "3px 9px",
            borderRadius: 4,
          }}
        >
          {route.method}
        </span>
        <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
          {route.path}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{route.desc}</span>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          style={{
            marginLeft: "auto",
            padding: "5px 14px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: copied ? "#064E3B" : "var(--border)",
            cursor: "pointer",
            color: copied ? "#34D399" : "var(--text-muted)",
            fontSize: 11,
            fontWeight: 600,
            transition: "all .2s",
            fontFamily: "inherit",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Tables used */}
      <div
        style={{
          background: "var(--background)",
          borderBottom: "1px solid var(--border)",
          padding: "8px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 10, color: "#334155", marginRight: 4 }}>
          {route.tables.some((t) => t.startsWith("node:")) ? "MODULES:" : "TABLES:"}
        </span>
        {route.tables.map((t) => {
          const color = TABLE_COLOR[t] ?? "#94A3B8";
          return (
            <span
              key={t}
              style={{
                fontSize: 10,
                padding: "2px 8px",
                borderRadius: 4,
                background: `${color}22`,
                color,
                fontWeight: 600,
              }}
            >
              {t}
            </span>
          );
        })}
      </div>

      {/* Code */}
      <CodeBlock code={route.code} />
    </div>
  );
}
