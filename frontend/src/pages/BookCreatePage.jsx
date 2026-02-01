import React, { useEffect, useMemo, useState } from "react";
import Field from "../components/Field";

export default function BookCreatePage({
  theme,
  styles,
  createTitle,
  setCreateTitle,
  createAuthor,
  setCreateAuthor,
  authors,
  onSubmitCreate,
  resetCreateForm,
  setPage,
}) {
  const [authorMode, setAuthorMode] = useState("select"); // "select" | "new"
  const [selectedAuthorId, setSelectedAuthorId] = useState("");

  const sortedAuthors = useMemo(() => {
    const list = Array.isArray(authors) ? [...authors] : [];
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return list;
  }, [authors]);

  // Keep createAuthor synced with selected dropdown author
  useEffect(() => {
    if (authorMode !== "select") return;

    const idNum = Number(selectedAuthorId);
    const found = sortedAuthors.find((a) => a.id === idNum);

    // If there’s a valid selection, set createAuthor to that author name (canonical)
    if (found) setCreateAuthor(found.name);
  }, [authorMode, selectedAuthorId, sortedAuthors]);

  // When switching modes, do the sensible thing
  useEffect(() => {
    if (authorMode === "select") {
      // if nothing selected, default to first author (if any)
      if (!selectedAuthorId && sortedAuthors.length > 0) {
        setSelectedAuthorId(String(sortedAuthors[0].id));
        setCreateAuthor(sortedAuthors[0].name);
      }
      // if no authors exist, force "new"
      if (sortedAuthors.length === 0) {
        setAuthorMode("new");
        setSelectedAuthorId("");
        setCreateAuthor("");
      }
    } else {
      // "new" mode: clear dropdown selection but keep whatever user typed
      setSelectedAuthorId("");
    }
  }, [authorMode, sortedAuthors]);

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
        <Field label="Title">
          <input
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
            style={styles.inputStyle}
            placeholder="e.g. The Left Hand of Darkness"
          />
        </Field>

        <Field label="Author">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="authorModeCreate"
                checked={authorMode === "select"}
                onChange={() => setAuthorMode("select")}
                disabled={sortedAuthors.length === 0}
              />
              <span style={{ fontWeight: 650, color: sortedAuthors.length === 0 ? theme.muted : theme.fg }}>
                Select existing
              </span>
            </label>

            <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="authorModeCreate"
                checked={authorMode === "new"}
                onChange={() => setAuthorMode("new")}
              />
              <span style={{ fontWeight: 650 }}>Create new</span>
            </label>
          </div>

          {authorMode === "select" ? (
            <div style={{ marginTop: 10 }}>
              <select
                value={selectedAuthorId}
                onChange={(e) => setSelectedAuthorId(e.target.value)}
                style={styles.inputStyle}
              >
                {sortedAuthors.map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
              </select>

              <div style={{ marginTop: 8, color: theme.muted, fontSize: 13 }}>
                Pick an author from the list (no typing required).
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <input
                value={createAuthor}
                onChange={(e) => setCreateAuthor(e.target.value)}
                style={styles.inputStyle}
                placeholder="Type a new author name..."
              />
              <div style={{ marginTop: 8, color: theme.muted, fontSize: 13 }}>
                If this author doesn’t exist yet, it will be created automatically when you create the book.
              </div>
            </div>
          )}
        </Field>

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="submit" style={styles.primaryButtonStyle}>
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              resetCreateForm();
              setAuthorMode("select");
              setSelectedAuthorId("");
            }}
            style={styles.headerButtonStyle}
          >
            Clear
          </button>
          <button type="button" onClick={() => setPage("BOOKS_LIST")} style={styles.headerButtonStyle}>
            Back to list
          </button>
        </div>
      </form>
    </div>
  );
}
