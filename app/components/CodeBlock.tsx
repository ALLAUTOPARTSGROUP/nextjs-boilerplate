"use client";

import { type ReactNode, useState } from "react";

// Token types and their patterns (order matters — first match wins)
const TOKEN_PATTERNS: [RegExp, string][] = [
  // Full-line comments
  [/^(\s*\/\/.*)$/, "comment"],
  // Multi-line comments
  [/(\/\*[\s\S]*?\*\/)/, "comment"],
  // Template literals with interpolation
  [/(`[^`]*`)/, "string"],
  // Strings
  [/(["'][^"'\n]*["'])/, "string"],
  // Keywords
  [/\b(const|let|var|await|async|return|try|catch|finally|for|of|in|if|else|new|throw|import|export|from|require|function|class|extends|this|super|typeof|instanceof)\b/, "keyword"],
  // Boolean & null
  [/\b(true|false|null|undefined)\b/, "keyword"],
  // Numbers
  [/\b(\d+\.?\d*|0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+)\b/, "number"],
  // Function calls: name followed by (
  [/\b([a-zA-Z_$][\w$]*)\s*(?=\()/, "function"],
  // Property access after .
  [/\.([a-zA-Z_$][\w$]*)/, "property"],
  // Operators
  [/(=>|===|!==|==|!=|<=|>=|&&|\|\||\.{3}|\+\+|--|[+\-*/%=<>!&|^~?:])/, "operator"],
  // Template interpolation
  [/(\$\{[^}]+\})/, "interpolation"],
];

const COLOR_MAP: Record<string, string> = {
  comment: "var(--code-comment)",
  string: "var(--code-string)",
  keyword: "var(--code-keyword)",
  number: "var(--code-number)",
  function: "var(--code-function)",
  property: "var(--code-property)",
  operator: "var(--code-operator)",
  interpolation: "var(--code-number)",
  base: "var(--code-base)",
};

function tokenize(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let remaining = line;
  let keyIdx = 0;

  // Handle full-line comments first
  if (/^\s*\/\//.test(line)) {
    return [
      <span key={0} style={{ color: COLOR_MAP.comment, fontStyle: "italic" }}>
        {line}
      </span>,
    ];
  }

  while (remaining.length > 0) {
    let matched = false;

    for (const [pattern, tokenType] of TOKEN_PATTERNS) {
      const match = remaining.match(pattern);
      if (match && match.index !== undefined) {
        // Add any text before the match as base
        if (match.index > 0) {
          parts.push(
            <span key={keyIdx++} style={{ color: COLOR_MAP.base }}>
              {remaining.slice(0, match.index)}
            </span>
          );
        }

        // Add the matched token
        const color = COLOR_MAP[tokenType];
        const text = tokenType === "property" ? "." + match[1] : match[0];
        parts.push(
          <span
            key={keyIdx++}
            style={{
              color,
              fontStyle: tokenType === "comment" ? "italic" : undefined,
            }}
          >
            {text}
          </span>
        );

        remaining = remaining.slice(match.index + match[0].length);
        matched = true;
        break;
      }
    }

    // No pattern matched — consume one character as base
    if (!matched) {
      parts.push(
        <span key={keyIdx++} style={{ color: COLOR_MAP.base }}>
          {remaining[0]}
        </span>
      );
      remaining = remaining.slice(1);
    }
  }

  return parts;
}

interface LineProps {
  lineNumber: number;
  content: string;
  isHighlighted?: boolean;
}

function CodeLine({ lineNumber, content, isHighlighted }: LineProps) {
  return (
    <div
      style={{
        display: "flex",
        background: isHighlighted ? "var(--line-highlight)" : undefined,
        borderLeft: isHighlighted ? "2px solid var(--accent-blue)" : "2px solid transparent",
        paddingLeft: 8,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 40,
          textAlign: "right",
          paddingRight: 16,
          color: "var(--line-number)",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        {lineNumber}
      </span>
      <span style={{ flex: 1 }}>{tokenize(content)}</span>
    </div>
  );
}

interface CollapsibleBlockProps {
  startLine: number;
  lines: string[];
  label: string;
}

function CollapsibleBlock({ startLine, lines, label }: CollapsibleBlockProps) {
  const [collapsed, setCollapsed] = useState(true);

  if (collapsed) {
    return (
      <div
        onClick={() => setCollapsed(false)}
        style={{
          display: "flex",
          cursor: "pointer",
          paddingLeft: 8,
          borderLeft: "2px solid transparent",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 40,
            textAlign: "right",
            paddingRight: 16,
            color: "var(--line-number)",
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          {startLine}
        </span>
        <span
          style={{
            color: "var(--code-comment)",
            fontStyle: "italic",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 10, color: "var(--accent-blue)" }}>+{lines.length}</span>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div onClick={() => setCollapsed(true)} style={{ cursor: "pointer" }}>
      {lines.map((line, i) => (
        <CodeLine key={startLine + i} lineNumber={startLine + i} content={line} />
      ))}
    </div>
  );
}

export function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect multi-line comment blocks (3+ lines starting with //)
    if (/^\s*\/\//.test(line)) {
      const blockStart = i;
      const commentLines: string[] = [line];
      let j = i + 1;
      while (j < lines.length && /^\s*\/\//.test(lines[j])) {
        commentLines.push(lines[j]);
        j++;
      }

      if (commentLines.length >= 3) {
        // Collapsible comment block
        const firstComment = commentLines[0].replace(/^\s*\/\/\s*/, "").slice(0, 40);
        elements.push(
          <CollapsibleBlock
            key={blockStart}
            startLine={blockStart + 1}
            lines={commentLines}
            label={`// ${firstComment}${firstComment.length >= 40 ? "..." : ""}`}
          />
        );
        i = j;
        continue;
      }
    }

    elements.push(<CodeLine key={i} lineNumber={i + 1} content={line} />);
    i++;
  }

  return (
    <pre
      style={{
        flex: 1,
        margin: 0,
        padding: "16px 0",
        overflowY: "auto",
        fontSize: 12.5,
        lineHeight: 1.75,
        fontFamily: "var(--font-mono), 'Fira Code', monospace",
      }}
    >
      {elements}
    </pre>
  );
}
