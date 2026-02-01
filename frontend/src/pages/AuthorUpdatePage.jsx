import React from "react";
import Field from "../components/Field";

export default function AuthorUpdatePage({
  theme,
  styles,
  selectedAuthorSingle,
  updateName,
  setUpdateName,
  onSubmitUpdate,
  onResetUpdate,
  setPage,
}) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        background: theme.card,
        maxWidth: 720,
      }}
    >
      {!selectedAuthorSingle ? (
        <div style={{ color: theme.muted }}>
          Select exactly one author on the <strong>Authors list</strong> page, then click <strong>Update</strong>.
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setPage("AUTHORS_LIST")} style={styles.headerButtonStyle}>
              Back to list
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmitUpdate}>
          <div style={{ color: theme.muted, fontSize: 13 }}>
            Updating{" "}
            <code style={{ background: theme.codeBg, padding: "2px 6px", borderRadius: 6 }}>
              #{selectedAuthorSingle.id}
            </code>
          </div>

          <Field label="Name">
            <input value={updateName} onChange={(e) => setUpdateName(e.target.value)} style={styles.inputStyle} />
          </Field>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" style={styles.primaryButtonStyle}>
              Save changes
            </button>
            <button type="button" onClick={onResetUpdate} style={styles.headerButtonStyle}>
              Reset
            </button>
            <button type="button" onClick={() => setPage("AUTHORS_LIST")} style={styles.headerButtonStyle}>
              Back to list
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
