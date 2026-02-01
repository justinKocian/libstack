import React, { useEffect, useMemo, useState } from "react";
import Field from "../components/Field";

export default function BookUpdatePage({
  theme,
  styles,
  selectedBookSingle,
  updateTitle,
  setUpdateTitle,
  updateAuthor,
  setUpdateAuthor,
  authors,
  onSubmitUpdate,
  onResetUpdate,
  setPage,
}) {
  const [authorMode, setAuthorMode] = useState("select"); // "select" | "new"
  const [selectedAuthorId, setSelectedAuthorId] = useState("");

  const sortedAuthors = useMemo(() => {
    const list = Array.isArray(authors) ? [...authors] : [];
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return list;
  }, [authors]);

  // When page loads / selected book changes, try to map book.author -> an author id
  useEffect(() => {
    if (!selectedBookSingle) return;

    // If we have authors, attempt to match current author (case-insensitive)
    const current = (selectedBookSingle.author || "").trim().toLowerCase();
    const match = sortedAuthors.find((a) => (a.name || "").trim().toLowerCase() === current);

    if (match) {
      setAuthorMode("select");
      setSelectedAuthorId(String(match.id));
      setUpdateAuthor(match.name); // canonical
    } else {
      // author not in list (possible if legacy data) => fall back to "new"
      setAuthorMode("new");
      setSelectedAuthorId("");
      setUpdateAuthor(selectedBookSingle.author || "");
    }
  }, [selectedBookSingle, sortedAuthors]);

  // Keep updateAuthor synced when dropdown changes
  useEffect(() => {
    if (authorMode !== "select") return;

    const idNum = Number(selectedAuthorId);
    const found = sortedAuthors.find((a) => a.id === idNum);
    if (found) setUpdateAuthor(found.name);
  }, [authorMode, selectedAuthorId, sortedAuthors]);

  // If no authors exist, force new mode
  useEffect(() => {
    if (sortedAuthors.length === 0) {
      setAuthorMode("new");
      setSelectedAuthorId("");
    }
  }, [sortedAuthors]);

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
      {!selectedBookSingle ? (
        <div style={{ color: theme.muted }}>
          Select exactly one book on the <strong>Books</strong> list page, then click <strong>Update</strong>.
          <div style={{ marginTop: 10 }}>
            <button onClick={() => setPage("BOOKS_LIST")} style={styles.headerButtonStyle}>
              Back to list
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmitUpdate}>
          <div style={{ color: theme.muted, fontSize: 13 }}>
            Updating{" "}
            <code style={{ background: theme.codeBg, padding: "2px 6px", borderRadius: 6 }}>
              #{selectedBookSingle.id}
            </code>
          </div>

          <Field label="Title">
            <input value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} style={styles.inputStyle} />
          </Field>

          <Field label="Author">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="authorModeUpdate"
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
                  name="authorModeUpdate"
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
                  Pick an author from the list.
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <input
                  value={updateAuthor}
                  onChange={(e) => setUpdateAuthor(e.target.value)}
                  style={styles.inputStyle}
                  placeholder="Type a new author name..."
                />
                <div style={{ marginTop: 8, color: theme.muted, fontSize: 13 }}>
                  If this author doesn’t exist yet, it will be created automatically when you save the book.
                </div>
              </div>
            )}
          </Field>

          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" style={styles.primaryButtonStyle}>
              Save changes
            </button>
            <button
              type="button"
              onClick={() => {
                onResetUpdate();
                // best-effort reset author selection
                setAuthorMode("select");
              }}
              style={styles.headerButtonStyle}
            >
              Reset
            </button>
            <button type="button" onClick={() => setPage("BOOKS_LIST")} style={styles.headerButtonStyle}>
              Back to list
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
