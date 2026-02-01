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

function SelectableRow({ theme, book, selected, onToggle }) {
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
      <td style={tdStyle(theme)}>{book.id}</td>
      <td style={tdStyle(theme)}>{book.title}</td>
      <td style={tdStyle(theme)}>{book.author}</td>
    </tr>
  );
}

export default function BooksListPage({
  theme,
  styles,
  books = [],
  booksLoading = false,
  loadBooks = () => {},
  selectedIds,
  setSelectedIds = () => {},
  resetMessages = () => {},
  onUpdateClick = () => {},
  onDeleteClick = () => {},
}) {
  const safeSelectedIds = selectedIds instanceof Set ? selectedIds : new Set();

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

  const sortedBooks = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const list = Array.isArray(books) ? books : [];

    return [...list].sort((a, b) => {
      const av = a?.[sortBy];
      const bv = b?.[sortBy];

      const aVal = typeof av === "string" ? av.toLowerCase() : av;
      const bVal = typeof bv === "string" ? bv.toLowerCase() : bv;

      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
  }, [books, sortBy, sortDir]);

  const selectedCount = safeSelectedIds.size;
  const allSelected = sortedBooks.length > 0 && safeSelectedIds.size === sortedBooks.length;

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function selectAllVisible() {
    setSelectedIds(new Set(sortedBooks.map((b) => b.id)));
  }

  function toggleSelected(id) {
    setSelectedIds((prev) => {
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
        <div style={{ fontWeight: 900, flex: 1 }}>All Books</div>

        <button
          onClick={() => {
            resetMessages();
            if (sortedBooks.length === 0) return;
            if (allSelected) clearSelection();
            else selectAllVisible();
          }}
          style={styles.headerButtonStyle}
          disabled={sortedBooks.length === 0}
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

        <button onClick={loadBooks} style={styles.primaryButtonStyle} disabled={booksLoading}>
          {booksLoading ? "Loading..." : "Reload"}
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
                  disabled={sortedBooks.length === 0}
                />
              </th>

              <th style={thStyle(theme, true)} onClick={() => toggleSort("id")}>
                ID <SortIndicator active={sortBy === "id"} dir={sortDir} />
              </th>

              <th style={thStyle(theme, true)} onClick={() => toggleSort("title")}>
                Title <SortIndicator active={sortBy === "title"} dir={sortDir} />
              </th>

              <th style={thStyle(theme, true)} onClick={() => toggleSort("author")}>
                Author <SortIndicator active={sortBy === "author"} dir={sortDir} />
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedBooks.map((b) => (
              <SelectableRow
                key={b.id}
                theme={theme}
                book={b}
                selected={safeSelectedIds.has(b.id)}
                onToggle={() => {
                  resetMessages();
                  toggleSelected(b.id);
                }}
              />
            ))}

            {sortedBooks.length === 0 && !booksLoading && (
              <tr>
                <td colSpan={4} style={tdStyle(theme)}>
                  No books yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
