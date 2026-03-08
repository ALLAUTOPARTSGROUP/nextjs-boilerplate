"use client";

import { type ReactNode } from "react";

const KEYWORD_RE =
  /\b(const|let|await|async|return|try|catch|for|of|if|new|throw)\b|(\/\/[^\n]*)|(["'`][^"'`\n]*["'`])|(\$\{[^}]+\})/g;

function colorizeLine(line: string, key: number): ReactNode {
  if (line.trim().startsWith("//")) {
    return (
      <span key={key} style={{ color: "var(--code-comment)", fontStyle: "italic" }}>
        {line + "\n"}
      </span>
    );
  }

  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  KEYWORD_RE.lastIndex = 0;

  while ((m = KEYWORD_RE.exec(line)) !== null) {
    if (m.index > last) {
      parts.push(
        <span key={`p${last}`} style={{ color: "var(--code-base)" }}>
          {line.slice(last, m.index)}
        </span>
      );
    }
    const color = m[1]
      ? "var(--code-keyword)"
      : m[2]
      ? "var(--code-comment)"
      : m[3]
      ? "var(--code-string)"
      : "#FCD34D";
    parts.push(
      <span key={`k${m.index}`} style={{ color }}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }

  if (last < line.length) {
    parts.push(
      <span key={`e${last}`} style={{ color: "var(--code-base)" }}>
        {line.slice(last)}
      </span>
    );
  }

  return (
    <span key={key}>
      {parts}
      {"\n"}
    </span>
  );
}

export function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      style={{
        flex: 1,
        margin: 0,
        padding: "20px 24px",
        overflowY: "auto",
        fontSize: 12.5,
        lineHeight: 1.85,
        fontFamily: "var(--font-mono), 'Fira Code', monospace",
      }}
    >
      {code.split("\n").map((line, i) => colorizeLine(line, i))}
    </pre>
  );
}
