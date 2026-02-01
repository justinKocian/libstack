import React, { useState } from "react";

function SidebarItem({ theme, collapsed, active, label, icon, onClick }) {
  const [hover, setHover] = useState(false);
  const bg = active ? theme.sidebarItemHover : hover ? theme.sidebarItemHover : "transparent";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={collapsed ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: collapsed ? "10px 10px" : "10px 12px",
        borderRadius: 10,
        cursor: "pointer",
        userSelect: "none",
        background: bg,
        color: theme.fg,
        marginBottom: 6,
        border: `1px solid ${active || hover ? theme.border : "transparent"}`,
        transition: "padding 220ms ease",
      }}
    >
      <span style={{ width: 24, textAlign: "center" }}>{icon}</span>
      {!collapsed && (
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: active ? 800 : 600,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export default function Sidebar({
  theme,
  sidebarWidth,
  sidebarCollapsed,
  setSidebarCollapsed,
  page,
  setPage,
  health,
}) {
  const isBooks = page.startsWith("BOOKS_") || ["LIST", "CREATE", "UPDATE", "DELETE"].includes(page); // backward compat
  const isAuthors = page.startsWith("AUTHORS_");

  return (
    <aside
      style={{
        width: sidebarWidth,
        background: theme.sidebarBg,
        borderRight: `1px solid ${theme.border}`,
        transition: "width 220ms ease",
        overflow: "hidden",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: sidebarCollapsed ? 10 : 16,
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          transition: "padding 220ms ease",
        }}
      >
        <button
          onClick={() => setSidebarCollapsed((v) => !v)}
          style={{
            height: 36,
            width: 36,
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            background: theme.card,
            color: theme.fg,
            cursor: "pointer",
            flexShrink: 0,
          }}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          {sidebarCollapsed ? "☰" : "⟨⟨"}
        </button>

        {!sidebarCollapsed && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, lineHeight: 1.1 }}>Library</div>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>Books + Authors</div>
          </div>
        )}
      </div>

      <nav style={{ padding: sidebarCollapsed ? 6 : 10 }}>
        {!sidebarCollapsed && (
          <div style={{ fontSize: 12, color: theme.muted, fontWeight: 800, margin: "6px 10px 8px" }}>
            Books
          </div>
        )}

        <SidebarItem
          theme={theme}
          collapsed={sidebarCollapsed}
          active={page === "BOOKS_LIST" || page === "LIST" || page === "BOOKS_UPDATE" || page === "BOOKS_DELETE"}
          label="List"
          icon="📚"
          onClick={() => setPage("BOOKS_LIST")}
        />
        <SidebarItem
          theme={theme}
          collapsed={sidebarCollapsed}
          active={page === "BOOKS_CREATE" || page === "CREATE"}
          label="Create"
          icon="➕"
          onClick={() => setPage("BOOKS_CREATE")}
        />

        {!sidebarCollapsed && (
          <div style={{ fontSize: 12, color: theme.muted, fontWeight: 800, margin: "14px 10px 8px" }}>
            Authors
          </div>
        )}

        <SidebarItem
          theme={theme}
          collapsed={sidebarCollapsed}
          active={page === "AUTHORS_LIST" || page === "AUTHORS_UPDATE" || page === "AUTHORS_DELETE"}
          label="List"
          icon="🧑‍💼"
          onClick={() => setPage("AUTHORS_LIST")}
        />
        <SidebarItem
          theme={theme}
          collapsed={sidebarCollapsed}
          active={page === "AUTHORS_CREATE"}
          label="Create"
          icon="✍️"
          onClick={() => setPage("AUTHORS_CREATE")}
        />
      </nav>

      <div
        style={{
          marginTop: "auto",
          padding: sidebarCollapsed ? 10 : 16,
          borderTop: `1px solid ${theme.border}`,
          transition: "padding 220ms ease",
        }}
      >
        {sidebarCollapsed ? (
          <div
            title={`API: ${health}`}
            style={{
              height: 28,
              width: 28,
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: theme.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            {health === "ok" ? "✓" : "!"}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: theme.muted, display: "flex", gap: 8, alignItems: "center" }}>
            <span>API:</span>
            <code style={{ background: theme.codeBg, padding: "2px 6px", borderRadius: 6 }}>{health}</code>
          </div>
        )}
      </div>
    </aside>
  );
}
