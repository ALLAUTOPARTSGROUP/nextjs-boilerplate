"use client";

import { ROUTES, METHOD_COLOR, type RouteItem } from "../data/routes";

interface SidebarProps {
  active: RouteItem;
  onSelect: (item: RouteItem) => void;
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <nav
      aria-label="API routes"
      style={{
        width: 240,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      {ROUTES.map((group) => (
        <div key={group.group}>
          <div
            style={{
              padding: "12px 14px 6px",
              fontSize: 10,
              fontWeight: 700,
              color: group.color,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
            }}
          >
            {group.group}
          </div>

          {group.items.map((item) => {
            const isActive = active === item;
            return (
              <button
                key={item.path}
                onClick={() => onSelect(item)}
                aria-current={isActive ? "page" : undefined}
                style={{
                  width: "100%",
                  padding: "8px 14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: isActive ? "var(--border)" : "transparent",
                  borderLeft: isActive
                    ? `2px solid ${group.color}`
                    : "2px solid transparent",
                  border: "none",
                  borderLeftWidth: 2,
                  borderLeftStyle: "solid",
                  borderLeftColor: isActive ? group.color : "transparent",
                  transition: "all .12s",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: METHOD_COLOR[item.method] ?? "var(--text-secondary)",
                    width: 34,
                    flexShrink: 0,
                  }}
                >
                  {item.method}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.path}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
