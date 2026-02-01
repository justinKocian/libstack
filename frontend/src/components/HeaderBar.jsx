import React from "react";

function titleFor(page) {
  switch (page) {
    case "BOOKS_LIST":
      return "Books";
    case "BOOKS_CREATE":
      return "Create Book";
    case "BOOKS_UPDATE":
      return "Update Book";
    case "BOOKS_DELETE":
      return "Delete Books";
    case "AUTHORS_LIST":
      return "Authors";
    case "AUTHORS_CREATE":
      return "Create Author";
    case "AUTHORS_UPDATE":
      return "Update Author";
    case "AUTHORS_DELETE":
      return "Delete Authors";
    default:
      // Backwards-compat titles if you still had LIST/CREATE/etc in state
      if (page === "LIST") return "Books";
      if (page === "CREATE") return "Create Book";
      if (page === "UPDATE") return "Update Book";
      if (page === "DELETE") return "Delete Books";
      return "Dashboard";
  }
}

export default function HeaderBar({
  theme,
  styles,
  page,
  loadHealth,
  debug,
  setDebug,
  dark,
  setDark,
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <h1 style={{ margin: 0, flex: 1 }}>{titleFor(page)}</h1>

      <button onClick={loadHealth} style={styles.headerButtonStyle} title="Refresh health">
        Refresh
      </button>

      <button onClick={() => setDebug((v) => !v)} style={styles.headerButtonStyle} title="Toggle debug mode">
        Debug: {debug ? "ON" : "OFF"}
      </button>

      <button
        onClick={() => setDark((v) => !v)}
        style={{ ...styles.headerButtonStyle, background: theme.buttonBg, color: theme.buttonFg }}
        title="Toggle dark mode"
      >
        {dark ? "Light mode" : "Dark mode"}
      </button>
    </div>
  );
}
