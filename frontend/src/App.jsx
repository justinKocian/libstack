import React, { useEffect, useMemo, useState } from "react";

import { apiFetch } from "./lib/api";
import { isDebugEnabled, persistDebug, logDebug } from "./lib/debug";
import { getTheme, getStyles } from "./lib/theme";

import Sidebar from "./components/Sidebar";
import HeaderBar from "./components/HeaderBar";
import Messages from "./components/Messages";
import Badge from "./components/Badge";

import BooksListPage from "./pages/BooksListPage";
import BookCreatePage from "./pages/BookCreatePage";
import BookUpdatePage from "./pages/BookUpdatePage";
import BookDeletePage from "./pages/BookDeletePage";

import AuthorsListPage from "./pages/AuthorsListPage";
import AuthorCreatePage from "./pages/AuthorCreatePage";
import AuthorUpdatePage from "./pages/AuthorUpdatePage";
import AuthorDeletePage from "./pages/AuthorDeletePage";

export default function App() {
  // Flags
  const [dark, setDark] = useState(false);
  const [debug, setDebug] = useState(isDebugEnabled());

  // Sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const SIDEBAR_OPEN_WIDTH = 260;
  const SIDEBAR_COLLAPSED_WIDTH = 56;
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_OPEN_WIDTH;

  // Pages
  const [page, setPage] = useState("BOOKS_LIST"); // BOOKS_* | AUTHORS_*

  // Health
  const [health, setHealth] = useState("checking...");
  const [healthPayload, setHealthPayload] = useState(null);

  // Books
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);

  const [bookSelectedIds, setBookSelectedIds] = useState(() => new Set());
  const bookSelectedCount = bookSelectedIds.size;
  const bookSelectedSingleId = bookSelectedCount === 1 ? Array.from(bookSelectedIds)[0] : null;
  const selectedBookSingle = bookSelectedSingleId ? books.find((b) => b.id === bookSelectedSingleId) || null : null;

  // Authors
  const [authors, setAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);

  const [authorSelectedIds, setAuthorSelectedIds] = useState(() => new Set());
  const authorSelectedCount = authorSelectedIds.size;
  const authorSelectedSingleId = authorSelectedCount === 1 ? Array.from(authorSelectedIds)[0] : null;
  const selectedAuthorSingle = authorSelectedSingleId
    ? authors.find((a) => a.id === authorSelectedSingleId) || null
    : null;

  // Books forms
  const [createTitle, setCreateTitle] = useState("");
  const [createAuthor, setCreateAuthor] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateAuthor, setUpdateAuthor] = useState("");

  // Authors forms
  const [authorCreateName, setAuthorCreateName] = useState("");
  const [authorUpdateName, setAuthorUpdateName] = useState("");

  // Messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Delete state
  const [deletingBooks, setDeletingBooks] = useState(false);
  const [deletingAuthors, setDeletingAuthors] = useState(false);

  const theme = useMemo(() => getTheme(dark), [dark]);
  const styles = useMemo(() => getStyles(theme), [theme]);

  function resetMessages() {
    setErrorMsg("");
    setSuccessMsg("");
  }

  // Persist debug preference
  useEffect(() => {
    persistDebug(debug);
  }, [debug]);

  async function loadHealth() {
    try {
      const t0 = performance.now();
      const data = await apiFetch("/health");
      const ms = Math.round(performance.now() - t0);
      setHealth(data.status ?? "unknown");
      setHealthPayload({ ...data, _ms: ms });
      logDebug(debug, "Fetched /health", { ms, data });
    } catch (e) {
      setHealth("error");
      setHealthPayload({ error: String(e) });
      logDebug(debug, "Fetch /health failed", e);
    }
  }

  async function loadBooks() {
    setBooksLoading(true);
    try {
      const t0 = performance.now();
      const data = await apiFetch("/api/books");
      const ms = Math.round(performance.now() - t0);

      const list = Array.isArray(data) ? data : [];
      setBooks(list);

      setBookSelectedIds((prev) => {
        const valid = new Set(list.map((b) => b.id));
        const next = new Set();
        for (const id of prev) if (valid.has(id)) next.add(id);
        return next;
      });

      logDebug(debug, "Fetched /api/books", { ms, count: list.length });
    } catch (e) {
      setErrorMsg(String(e.message || e));
      logDebug(debug, "Fetch /api/books failed", e);
    } finally {
      setBooksLoading(false);
    }
  }

  async function loadAuthors() {
    setAuthorsLoading(true);
    try {
      const t0 = performance.now();
      const data = await apiFetch("/api/authors");
      const ms = Math.round(performance.now() - t0);

      const list = Array.isArray(data) ? data : [];
      setAuthors(list);

      setAuthorSelectedIds((prev) => {
        const valid = new Set(list.map((a) => a.id));
        const next = new Set();
        for (const id of prev) if (valid.has(id)) next.add(id);
        return next;
      });

      logDebug(debug, "Fetched /api/authors", { ms, count: list.length });
    } catch (e) {
      setErrorMsg(String(e.message || e));
      logDebug(debug, "Fetch /api/authors failed", e);
    } finally {
      setAuthorsLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    loadHealth();
    loadAuthors();
    loadBooks();
  }, [debug]);

  // Page transitions
  useEffect(() => {
    resetMessages();

    // Keep author list fresh so book pages always have it
    if (page.startsWith("BOOKS_")) {
      loadAuthors();
    }

    if (page === "BOOKS_LIST") loadBooks();
    if (page === "AUTHORS_LIST") loadAuthors();

    if (page === "BOOKS_UPDATE") {
      if (selectedBookSingle) {
        setUpdateTitle(selectedBookSingle.title);
        setUpdateAuthor(selectedBookSingle.author);
      } else {
        setUpdateTitle("");
        setUpdateAuthor("");
      }
    }

    if (page === "AUTHORS_UPDATE") {
      if (selectedAuthorSingle) setAuthorUpdateName(selectedAuthorSingle.name);
      else setAuthorUpdateName("");
    }
  }, [page]);

  // -----------------------
  // Books actions
  // -----------------------
  function handleBooksUpdateClick() {
    resetMessages();
    if (bookSelectedIds.size !== 1) {
      setErrorMsg("Select exactly one book to update.");
      return;
    }
    setPage("BOOKS_UPDATE");
  }

  function handleBooksDeleteClick() {
    resetMessages();
    if (bookSelectedIds.size < 1) {
      setErrorMsg("Select one or more books to delete.");
      return;
    }
    setPage("BOOKS_DELETE");
  }

  async function handleCreateBook(e) {
    e.preventDefault();
    resetMessages();

    try {
      const payload = { title: createTitle.trim(), author: createAuthor.trim() };
      const created = await apiFetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSuccessMsg(`Created book #${created.id}`);
      setCreateTitle("");
      setCreateAuthor("");

      await loadAuthors(); // in case author was newly created
      await loadBooks();
      setPage("BOOKS_LIST");
    } catch (err) {
      setErrorMsg(err.message || "Create failed");
      logDebug(debug, "Create book failed", err);
    }
  }

  async function handleUpdateBook(e) {
    e.preventDefault();
    resetMessages();

    if (!selectedBookSingle) {
      setErrorMsg("Select exactly one book to update.");
      return;
    }

    const title = updateTitle.trim();
    const author = updateAuthor.trim();

    const payload = {};
    if (title && title !== selectedBookSingle.title) payload.title = title;
    if (author && author !== selectedBookSingle.author) payload.author = author;

    if (Object.keys(payload).length === 0) {
      setErrorMsg("No changes detected. Modify title and/or author before saving.");
      return;
    }

    try {
      const updated = await apiFetch(`/api/books/${selectedBookSingle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSuccessMsg(`Updated book #${updated.id}`);

      await loadAuthors(); // in case author was newly created
      await loadBooks();
      setPage("BOOKS_LIST");
    } catch (err) {
      setErrorMsg(err.message || "Update failed");
      logDebug(debug, "Update book failed", err);
    }
  }

  function resetBookUpdateForm() {
    resetMessages();
    if (selectedBookSingle) {
      setUpdateTitle(selectedBookSingle.title);
      setUpdateAuthor(selectedBookSingle.author);
    }
  }

  function resetBookCreateForm() {
    setCreateTitle("");
    setCreateAuthor("");
    resetMessages();
  }

  async function handleBooksMassDeleteConfirmed() {
    resetMessages();
    if (bookSelectedIds.size < 1) {
      setErrorMsg("Select one or more books to delete.");
      return;
    }

    setDeletingBooks(true);
    try {
      const ids = Array.from(bookSelectedIds);
      let ok = 0;
      let failed = 0;

      for (const id of ids) {
        try {
          await apiFetch(`/api/books/${id}`, { method: "DELETE" });
          ok += 1;
        } catch (e) {
          failed += 1;
          logDebug(debug, `Delete failed for book id=${id}`, e);
        }
      }

      if (failed === 0) setSuccessMsg(`Deleted ${ok} book(s).`);
      else setErrorMsg(`Deleted ${ok} book(s), failed to delete ${failed}. Check debug logs.`);

      setBookSelectedIds(new Set());
      await loadBooks();
      setPage("BOOKS_LIST");
    } finally {
      setDeletingBooks(false);
    }
  }

  // -----------------------
  // Authors actions
  // -----------------------
  function handleAuthorsUpdateClick() {
    resetMessages();
    if (authorSelectedIds.size !== 1) {
      setErrorMsg("Select exactly one author to update.");
      return;
    }
    setPage("AUTHORS_UPDATE");
  }

  function handleAuthorsDeleteClick() {
    resetMessages();
    if (authorSelectedIds.size < 1) {
      setErrorMsg("Select one or more authors to delete.");
      return;
    }
    setPage("AUTHORS_DELETE");
  }

  async function handleCreateAuthor(e) {
    e.preventDefault();
    resetMessages();

    try {
      const payload = { name: authorCreateName.trim() };
      const created = await apiFetch("/api/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSuccessMsg(`Created author #${created.id}`);
      setAuthorCreateName("");
      await loadAuthors();
      setPage("AUTHORS_LIST");
    } catch (err) {
      setErrorMsg(err.message || "Create failed");
      logDebug(debug, "Create author failed", err);
    }
  }

  async function handleUpdateAuthor(e) {
    e.preventDefault();
    resetMessages();

    if (!selectedAuthorSingle) {
      setErrorMsg("Select exactly one author to update.");
      return;
    }

    const name = authorUpdateName.trim();
    const payload = {};
    if (name && name !== selectedAuthorSingle.name) payload.name = name;

    if (Object.keys(payload).length === 0) {
      setErrorMsg("No changes detected.");
      return;
    }

    try {
      const updated = await apiFetch(`/api/authors/${selectedAuthorSingle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSuccessMsg(`Updated author #${updated.id}`);
      await loadAuthors();
      setPage("AUTHORS_LIST");
    } catch (err) {
      setErrorMsg(err.message || "Update failed");
      logDebug(debug, "Update author failed", err);
    }
  }

  function resetAuthorCreateForm() {
    setAuthorCreateName("");
    resetMessages();
  }

  function resetAuthorUpdateForm() {
    resetMessages();
    if (selectedAuthorSingle) setAuthorUpdateName(selectedAuthorSingle.name);
  }

  async function handleAuthorsMassDeleteConfirmed() {
    resetMessages();
    if (authorSelectedIds.size < 1) {
      setErrorMsg("Select one or more authors to delete.");
      return;
    }

    setDeletingAuthors(true);
    try {
      const ids = Array.from(authorSelectedIds);
      let ok = 0;
      let failed = 0;

      for (const id of ids) {
        try {
          await apiFetch(`/api/authors/${id}`, { method: "DELETE" });
          ok += 1;
        } catch (e) {
          failed += 1;
          logDebug(debug, `Delete failed for author id=${id}`, e);
        }
      }

      if (failed === 0) setSuccessMsg(`Deleted ${ok} author(s).`);
      else setErrorMsg(`Deleted ${ok} author(s), failed to delete ${failed}. Check debug logs.`);

      setAuthorSelectedIds(new Set());
      await loadAuthors();
      setPage("AUTHORS_LIST");
    } finally {
      setDeletingAuthors(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.fg,
        fontFamily: "system-ui, sans-serif",
        transition: "background 200ms ease, color 200ms ease",
      }}
    >
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          theme={theme}
          sidebarWidth={sidebarWidth}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          page={page}
          setPage={setPage}
          health={health}
        />

        <main style={{ flex: 1, padding: 24, minWidth: 0 }}>
          <HeaderBar
            theme={theme}
            styles={styles}
            page={page}
            loadHealth={loadHealth}
            debug={debug}
            setDebug={setDebug}
            dark={dark}
            setDark={setDark}
          />

          <Messages theme={theme} errorMsg={errorMsg} successMsg={successMsg} />

          {/* BOOKS */}
          {page === "BOOKS_LIST" && (
            <BooksListPage
              theme={theme}
              styles={styles}
              books={books}
              booksLoading={booksLoading}
              loadBooks={loadBooks}
              selectedIds={bookSelectedIds}
              setSelectedIds={setBookSelectedIds}
              resetMessages={resetMessages}
              onUpdateClick={handleBooksUpdateClick}
              onDeleteClick={handleBooksDeleteClick}
            />
          )}

          {page === "BOOKS_CREATE" && (
            <BookCreatePage
              theme={theme}
              styles={styles}
              createTitle={createTitle}
              setCreateTitle={setCreateTitle}
              createAuthor={createAuthor}
              setCreateAuthor={setCreateAuthor}
              authors={authors}
              onSubmitCreate={handleCreateBook}
              resetCreateForm={resetBookCreateForm}
              setPage={setPage}
            />
          )}

          {page === "BOOKS_UPDATE" && (
            <BookUpdatePage
              theme={theme}
              styles={styles}
              selectedBookSingle={selectedBookSingle}
              updateTitle={updateTitle}
              setUpdateTitle={setUpdateTitle}
              updateAuthor={updateAuthor}
              setUpdateAuthor={setUpdateAuthor}
              authors={authors}
              onSubmitUpdate={handleUpdateBook}
              onResetUpdate={resetBookUpdateForm}
              setPage={setPage}
            />
          )}

          {page === "BOOKS_DELETE" && (
            <BookDeletePage
              theme={theme}
              styles={styles}
              books={books}
              selectedIds={bookSelectedIds}
              deleting={deletingBooks}
              onConfirmDelete={handleBooksMassDeleteConfirmed}
              setPage={setPage}
            />
          )}

          {/* AUTHORS */}
          {page === "AUTHORS_LIST" && (
            <AuthorsListPage
              theme={theme}
              styles={styles}
              authors={authors}
              authorsLoading={authorsLoading}
              loadAuthors={loadAuthors}
              selectedIds={authorSelectedIds}
              setSelectedIds={setAuthorSelectedIds}
              resetMessages={resetMessages}
              onUpdateClick={handleAuthorsUpdateClick}
              onDeleteClick={handleAuthorsDeleteClick}
            />
          )}

          {page === "AUTHORS_CREATE" && (
            <AuthorCreatePage
              theme={theme}
              styles={styles}
              createName={authorCreateName}
              setCreateName={setAuthorCreateName}
              onSubmitCreate={handleCreateAuthor}
              resetCreateForm={resetAuthorCreateForm}
              setPage={setPage}
            />
          )}

          {page === "AUTHORS_UPDATE" && (
            <AuthorUpdatePage
              theme={theme}
              styles={styles}
              selectedAuthorSingle={selectedAuthorSingle}
              updateName={authorUpdateName}
              setUpdateName={setAuthorUpdateName}
              onSubmitUpdate={handleUpdateAuthor}
              onResetUpdate={resetAuthorUpdateForm}
              setPage={setPage}
            />
          )}

          {page === "AUTHORS_DELETE" && (
            <AuthorDeletePage
              theme={theme}
              styles={styles}
              authors={authors}
              selectedIds={authorSelectedIds}
              deleting={deletingAuthors}
              onConfirmDelete={handleAuthorsMassDeleteConfirmed}
              setPage={setPage}
            />
          )}

          {debug && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                border: `1px dashed ${theme.border}`,
                borderRadius: 10,
                background: theme.card,
              }}
            >
              <div style={{ fontWeight: 900, color: theme.warn }}>Debug Panel</div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Badge theme={theme} label={`page=${page}`} />
                <Badge theme={theme} label={`dark=${String(dark)}`} />
                <Badge theme={theme} label={`sidebarCollapsed=${String(sidebarCollapsed)}`} />
                <Badge theme={theme} label={`sidebarWidth=${sidebarWidth}px`} />
                <Badge theme={theme} label={`booksCount=${books.length}`} />
                <Badge theme={theme} label={`authorsCount=${authors.length}`} />
                <Badge theme={theme} label={`bookSelected=${bookSelectedIds.size}`} />
                <Badge theme={theme} label={`authorSelected=${authorSelectedIds.size}`} />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 800 }}>Last /health payload</div>
                <pre
                  style={{
                    marginTop: 8,
                    background: theme.codeBg,
                    padding: 12,
                    borderRadius: 10,
                    overflowX: "auto",
                    fontSize: 12,
                  }}
                >
                  {JSON.stringify(healthPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
