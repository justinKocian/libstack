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

export default function AuthorDeletePage({
  theme,
  styles,
  authors,
  selectedIds,
  deleting,
  onConfirmDelete,
  setPage,
}) {
  const selectedCount = selectedIds.size;
  const selectedAuthors = authors.filter((a) => selectedIds.has(a.id));

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
          Select one or more authors on the <strong>Authors list</strong> page, then click <strong>Delete</strong>.
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setPage("AUTHORS_LIST")} style={styles.headerButtonStyle}>
              Back to list
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 900, color: theme.danger }}>Confirm delete ({selectedCount})</div>
          <div style={{ marginTop: 8, color: theme.muted }}>You are about to delete the following author(s):</div>

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
                  <th style={thStyle(theme)}>Name</th>
                </tr>
              </thead>
              <tbody>
                {selectedAuthors.map((a) => (
                  <tr key={a.id}>
                    <td style={tdStyle(theme)}>{a.id}</td>
                    <td style={tdStyle(theme)}>{a.name}</td>
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
            <button onClick={() => setPage("AUTHORS_LIST")} style={styles.headerButtonStyle} disabled={deleting}>
              Cancel
            </button>
          </div>

          <div style={{ marginTop: 10, color: theme.muted, fontSize: 13 }}>Deleting is permanent.</div>
        </div>
      )}
    </div>
  );
}
