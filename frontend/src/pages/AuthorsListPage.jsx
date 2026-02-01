import React, { useMemo, useState } from "react";

function thStyle(theme, clickable = false) {
  return {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: `1px solid ${theme.border}`,
    color: theme.muted,
    fontSize: 13,
    cursor: clickable ? "pointer" : "default",
    userSelect: "none",
  };
}

function tdStyle(theme) {
  return {
    padding: "10px 8px",
    borderBottom: `1px solid ${theme.border}`,
    verticalAlign: "top",
  };
}

function SortIndicator({ active, dir }) {
  if (!active) return null;
  return <span style={{ marginLeft: 6 }}>{dir === "asc" ? "▲" : "▼"}</span>;
}

function SelectableRow({ theme, author, selected, onToggle }) {
  const [hover, setHover] = useState(false);
  const bg = selected ? theme.rowSelected : hover ? theme.rowHover : "transparent";

  return (
    <tr
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: "pointer", background: bg }}
      title="Click row or checkbox to toggle selection"
    >
      <td style={{ ...tdStyle(theme), width: 46 }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        />
      </td>
      <td style={tdStyle(theme)}>{author.id}</td>
      <td style={tdStyle(theme)}>{author.name}</td>
    </tr>
  );
}

export default function AuthorsListPage({
  theme,
  styles,
  authors = [],
  authorsLoading = false,
  loadAuthors = () => {},
  selectedAuthorIds,
  setSelectedAuthorIds = () => {},
  resetMessages = () => {},
  onUpdateClick = () => {},
  onDeleteClick = () => {},
}) {
  const safeSelectedIds = selectedAuthorIds instanceof Set ? selectedAuthorIds : new Set();

  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  function toggleSort(col) {
    setSortBy((prev) => {
      if (prev === col) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return col;
    });
  }

  const sortedAuthors = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const list = Array.isArray(authors) ? authors : [];

    return [...list].sort((a, b) => {
      const av = a?.[sortBy];
      const bv = b?.[sortBy];

      const aVal = typeof av === "string" ? av.toLowerCase() : av;
      const bVal = typeof bv === "string" ? bv.toLowerCase() : bv;

      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }, [authors, sortBy, sortDir]);

  const selectedCount = safeSelectedIds.size;
  const allSelected = sortedAuthors.length > 0 && safeSelectedIds.size === sortedAuthors.length;

  function clearSelection() {
    setSelectedAuthorIds(new Set());
  }

  function selectAllVisible() {
    setSelectedAuthorIds(new Set(sortedAuthors.map((a) => a.id)));
  }

  function toggleSelected(id) {
    setSelectedAuthorIds((prev) => {
      const base = prev instanceof Set ? prev : new Set();
      const next = new Set(base);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        background: theme.card,
      }}
    >
      {/* Action bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 900, flex: 1 }}>All Authors</div>

        <button
          onClick={() => {
            resetMessages();
            if (sortedAuthors.length === 0) return;
            if (allSelected) clearSelection();
            else selectAllVisible();
          }}
          style={styles.headerButtonStyle}
          disabled={sortedAuthors.length === 0}
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>

        <button
          onClick={() => {
            resetMessages();
            clearSelection();
          }}
          style={styles.headerButtonStyle}
          disabled={selectedCount === 0}
        >
          Clear selection
        </button>

        <button
          onClick={onUpdateClick}
          style={{
            ...styles.primaryButtonStyle,
            ...(selectedCount === 1 ? {} : styles.disabledButtonStyle),
          }}
          disabled={selectedCount !== 1}
        >
          Update
        </button>

        <button
          onClick={onDeleteClick}
          style={{
            ...styles.dangerButtonStyle,
            ...(selectedCount >= 1 ? {} : styles.disabledButtonStyle),
          }}
          disabled={selectedCount < 1}
        >
          Delete {selectedCount >= 1 ? `(${selectedCount})` : ""}
        </button>

        <button onClick={loadAuthors} style={styles.primaryButtonStyle} disabled={authorsLoading}>
          {authorsLoading ? "Loading..." : "Reload"}
        </button>
      </div>

      <div style={{ marginTop: 10, color: theme.muted, fontSize: 13 }}>
        Select rows by clicking anywhere on the row or its checkbox. Update requires exactly 1 selection. Delete supports
        multiple.
      </div>

      {/* Table */}
      <div style={{ marginTop: 12, overflowX: "auto", paddingBottom: 80 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle(theme), width: 46 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => {
                    resetMessages();
                    if (allSelected) clearSelection();
                    else selectAllVisible();
                  }}
                  disabled={sortedAuthors.length === 0}
                />
              </th>

              <th style={thStyle(theme, true)} onClick={() => toggleSort("id")}>
                ID <SortIndicator active={sortBy === "id"} dir={sortDir} />
              </th>

              <th style={thStyle(theme, true)} onClick={() => toggleSort("name")}>
                Name <SortIndicator active={sortBy === "name"} dir={sortDir} />
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedAuthors.map((a) => (
              <SelectableRow
                key={a.id}
                theme={theme}
                author={a}
                selected={safeSelectedIds.has(a.id)}
                onToggle={() => {
                  resetMessages();
                  toggleSelected(a.id);
                }}
              />
            ))}

            {sortedAuthors.length === 0 && !authorsLoading && (
              <tr>
                <td colSpan={3} style={tdStyle(theme)}>
                  No authors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
