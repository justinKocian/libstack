import React from "react";

function thStyle(theme) {
  return {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: `1px solid ${theme.border}`,
    color: theme.muted,
    fontSize: 13,
  };
}

function tdStyle(theme) {
  return {
    padding: "10px 8px",
    borderBottom: `1px solid ${theme.border}`,
    verticalAlign: "top",
  };
}

function SelectableRow({ theme, book, selected, onToggle }) {
  const [hover, setHover] = React.useState(false);
  const bg = selected ? theme.rowSelected : hover ? theme.rowHover : "transparent";

  return (
    <tr
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ cursor: "pointer", background: bg }}
      title="Click to toggle selection"
    >
      <td style={{ ...tdStyle(theme), width: 46 }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          onClick={(e) => e.stopPropagation()}
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
  books,
  booksLoading,
  loadBooks,
  selectedIds,
  setSelectedIds,
  resetMessages,
  onUpdateClick,
  onDeleteClick,
}) {
  const selectedCount = selectedIds.size;

  const allSelected = books.length > 0 && selectedIds.size === books.length;

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function selectAllVisible() {
    setSelectedIds(new Set(books.map((b) => b.id)));
  }

  function toggleSelected(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
            if (books.length === 0) return;
            if (allSelected) clearSelection();
            else selectAllVisible();
          }}
          style={styles.headerButtonStyle}
          disabled={books.length === 0}
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>

        <button onClick={clearSelection} style={styles.headerButtonStyle} disabled={selectedCount === 0}>
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
        Select rows by clicking anywhere on the row or its checkbox. Update requires exactly 1 selection. Delete supports multiple.
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
                  disabled={books.length === 0}
                />
              </th>
              <th style={thStyle(theme)}>ID</th>
              <th style={thStyle(theme)}>Title</th>
              <th style={thStyle(theme)}>Author</th>
            </tr>
          </thead>

          <tbody>
            {books.map((b) => (
              <SelectableRow
                key={b.id}
                theme={theme}
                book={b}
                selected={selectedIds.has(b.id)}
                onToggle={() => {
                  resetMessages();
                  toggleSelected(b.id);
                }}
              />
            ))}

            {books.length === 0 && !booksLoading && (
              <tr>
                <td style={tdStyle(theme)} colSpan={4}>
                  No books yet. Create one from the sidebar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
