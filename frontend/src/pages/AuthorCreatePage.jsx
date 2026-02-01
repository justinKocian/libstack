import React from "react";
import Field from "../components/Field";

export default function AuthorCreatePage({
  theme,
  styles,
  createName,
  setCreateName,
  onSubmitCreate,
  resetCreateForm,
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
      <form onSubmit={onSubmitCreate}>
        <Field label="Name">
          <input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            style={styles.inputStyle}
            placeholder="e.g. Ursula K. Le Guin"
          />
        </Field>

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="submit" style={styles.primaryButtonStyle}>
            Create
          </button>
          <button type="button" onClick={resetCreateForm} style={styles.headerButtonStyle}>
            Clear
          </button>
          <button type="button" onClick={() => setPage("AUTHORS_LIST")} style={styles.headerButtonStyle}>
            Back to list
          </button>
        </div>
      </form>
    </div>
  );
}
