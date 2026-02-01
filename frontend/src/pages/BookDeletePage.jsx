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

export default function BookDeletePage({
  theme,
  styles,
  books,
  selectedIds,
  deleting,
  onConfirmDelete,
  setPage,
}) {
  const selectedCount = selectedIds.size;

  const selectedBooks = books.filter((b) => selectedIds.has(b.id));

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        background: theme.card,
        maxWidth: 860,
      }}
    >
      {selectedCount < 1 ? (
        <div style={{ color: theme.muted }}>
          Select one or more books on the <strong>List</strong> page, then click <strong>Delete</strong>.
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setPage("LIST")} style={styles.headerButtonStyle}>
              Back to list
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 900, color: theme.danger }}>Confirm delete ({selectedCount})</div>
          <div style={{ marginTop: 8, color: theme.muted }}>
            You are about to delete the following book(s):
          </div>

          <div
            style={{
              marginTop: 12,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle(theme)}>ID</th>
                  <th style={thStyle(theme)}>Title</th>
                  <th style={thStyle(theme)}>Author</th>
                </tr>
              </thead>
              <tbody>
                {selectedBooks.map((b) => (
                  <tr key={b.id}>
                    <td style={tdStyle(theme)}>{b.id}</td>
                    <td style={tdStyle(theme)}>{b.title}</td>
                    <td style={tdStyle(theme)}>{b.author}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={onConfirmDelete}
              style={{ ...styles.dangerButtonStyle, ...(deleting ? styles.disabledButtonStyle : {}) }}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : `Delete ${selectedCount}`}
            </button>
            <button onClick={() => setPage("LIST")} style={styles.headerButtonStyle} disabled={deleting}>
              Cancel
            </button>
          </div>

          <div style={{ marginTop: 10, color: theme.muted, fontSize: 13 }}>Deleting is permanent.</div>
        </div>
      )}
    </div>
  );
}
