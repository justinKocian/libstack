import json
import logging
import os
import time
from pathlib import Path
from typing import Callable, Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import String, create_engine, func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column

# ---------------------------
# Config
# ---------------------------
DEBUG = os.getenv("DEBUG", "0") == "1"
LOG_LEVEL = os.getenv("LOG_LEVEL", "info").upper()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://app:app@localhost:5432/app")

# ---------------------------
# Logging (structured-ish)
# ---------------------------
logger = logging.getLogger("app")
logger.setLevel(LOG_LEVEL)

handler = logging.StreamHandler()
handler.setLevel(LOG_LEVEL)


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "time": int(time.time()),
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload)


handler.setFormatter(JsonFormatter())
if not logger.handlers:
    logger.addHandler(handler)

# ---------------------------
# Database (SQLAlchemy 2.0)
# ---------------------------
engine = create_engine(DATABASE_URL, pool_pre_ping=True)


class Base(DeclarativeBase):
    pass


class Author(Base):
    __tablename__ = "authors"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    author: Mapped[str] = mapped_column(String(255))


def get_session() -> Session:
    return Session(engine)


def normalize(s: str) -> str:
    return s.strip().lower()


def author_exists_case_insensitive(s: Session, *, name: str, exclude_id: int | None = None) -> bool:
    stmt = select(Author.id).where(func.lower(Author.name) == normalize(name))
    if exclude_id is not None:
        stmt = stmt.where(Author.id != exclude_id)
    existing_id = s.execute(stmt.limit(1)).scalar_one_or_none()
    return existing_id is not None


def get_author_by_name_case_insensitive(s: Session, *, name: str) -> Author | None:
    stmt = select(Author).where(func.lower(Author.name) == normalize(name))
    return s.execute(stmt.limit(1)).scalar_one_or_none()


def get_or_create_author_by_name(s: Session, *, name: str) -> Author:
    """
    For book workflows: if author exists (case-insensitive), reuse it.
    Else, create it.
    """
    cleaned = name.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Author is required")

    existing = get_author_by_name_case_insensitive(s, name=cleaned)
    if existing:
        return existing

    a = Author(name=cleaned)
    s.add(a)
    s.flush()  # assign id without committing yet
    return a


def book_exists_case_insensitive(
    s: Session, *, title: str, author: str, exclude_id: int | None = None
) -> bool:
    stmt = select(Book.id).where(
        func.lower(Book.title) == normalize(title),
        func.lower(Book.author) == normalize(author),
    )
    if exclude_id is not None:
        stmt = stmt.where(Book.id != exclude_id)
    existing_id = s.execute(stmt.limit(1)).scalar_one_or_none()
    return existing_id is not None


# ---------------------------
# FastAPI
# ---------------------------
app = FastAPI(title="FastAPI + React (Docker)", debug=DEBUG)

FRONTEND_DIST = Path(__file__).resolve().parents[1] / "frontend_dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")


@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(engine)
        logger.info("Database tables ensured (create_all).")
    except SQLAlchemyError:
        logger.exception("Failed creating tables on startup.")
        raise


@app.middleware("http")
async def log_requests(request: Request, call_next: Callable):
    start = time.perf_counter()
    try:
        response = await call_next(request)
        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)")
        if DEBUG:
            logger.debug(
                json.dumps(
                    {
                        "event": "request_debug",
                        "method": request.method,
                        "path": request.url.path,
                        "query": str(request.url.query),
                        "client": request.client.host if request.client else None,
                    }
                )
            )
        return response
    except Exception:
        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.exception(f"Unhandled exception for {request.method} {request.url.path} ({duration_ms}ms)")
        raise


# ---------------------------
# Schemas
# ---------------------------
class AuthorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class AuthorUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)


class AuthorOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    author: str = Field(min_length=1, max_length=255)


class BookUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    author: Optional[str] = Field(default=None, min_length=1, max_length=255)


class BookOut(BaseModel):
    id: int
    title: str
    author: str

    class Config:
        from_attributes = True


# ---------------------------
# Basic routes
# ---------------------------
@app.get("/health")
def health():
    db_ok = True
    try:
        with get_session() as s:
            s.execute(select(1))
    except Exception:
        db_ok = False

    return {"status": "ok", "debug": DEBUG, "db": "ok" if db_ok else "error"}


@app.get("/")
def root():
    return RedirectResponse(url="/home")


@app.get("/home")
def home():
    index = FRONTEND_DIST / "index.html"
    return FileResponse(index)


# ---------------------------
# CRUD: /api/authors
# ---------------------------
@app.get("/api/authors", response_model=list[AuthorOut])
def list_authors():
    with get_session() as s:
        rows = s.execute(select(Author).order_by(Author.id.asc())).scalars().all()
        return rows


@app.get("/api/authors/{author_id}", response_model=AuthorOut)
def get_author(author_id: int):
    with get_session() as s:
        a = s.get(Author, author_id)
        if not a:
            raise HTTPException(status_code=404, detail="Author not found")
        return a


@app.post("/api/authors", response_model=AuthorOut, status_code=201)
def create_author(payload: AuthorCreate):
    name = payload.name.strip()
    with get_session() as s:
        if author_exists_case_insensitive(s, name=name):
            raise HTTPException(status_code=409, detail="Author already exists (case-insensitive).")

        a = Author(name=name)
        s.add(a)
        s.commit()
        s.refresh(a)
        return a


@app.put("/api/authors/{author_id}", response_model=AuthorOut)
def update_author(author_id: int, payload: AuthorUpdate):
    with get_session() as s:
        a = s.get(Author, author_id)
        if not a:
            raise HTTPException(status_code=404, detail="Author not found")

        if payload.name is not None:
            a.name = payload.name.strip()

        if author_exists_case_insensitive(s, name=a.name, exclude_id=author_id):
            raise HTTPException(status_code=409, detail="Another author already exists with that name (case-insensitive).")

        s.commit()
        s.refresh(a)
        return a


@app.delete("/api/authors/{author_id}", status_code=204)
def delete_author(author_id: int):
    with get_session() as s:
        a = s.get(Author, author_id)
        if not a:
            raise HTTPException(status_code=404, detail="Author not found")
        s.delete(a)
        s.commit()
        return None


# ---------------------------
# CRUD: /api/books
# ---------------------------
@app.get("/api/books", response_model=list[BookOut])
def list_books():
    with get_session() as s:
        rows = s.execute(select(Book).order_by(Book.id.asc())).scalars().all()
        return rows


@app.get("/api/books/{book_id}", response_model=BookOut)
def get_book(book_id: int):
    with get_session() as s:
        book = s.get(Book, book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        return book


@app.post("/api/books", response_model=BookOut, status_code=201)
def create_book(payload: BookCreate):
    title = payload.title.strip()
    author_name = payload.author.strip()

    with get_session() as s:
        # Ensure author exists (auto-create if missing)
        a = get_or_create_author_by_name(s, name=author_name)

        # Prevent duplicate book (case-insensitive title+author)
        if book_exists_case_insensitive(s, title=title, author=a.name):
            raise HTTPException(
                status_code=409,
                detail="Book already exists (case-insensitive match on title + author).",
            )

        book = Book(title=title, author=a.name)  # store canonical casing
        s.add(book)
        s.commit()
        s.refresh(book)
        return book


@app.put("/api/books/{book_id}", response_model=BookOut)
def update_book(book_id: int, payload: BookUpdate):
    with get_session() as s:
        book = s.get(Book, book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        if payload.title is not None:
            book.title = payload.title.strip()

        if payload.author is not None:
            a = get_or_create_author_by_name(s, name=payload.author.strip())
            book.author = a.name  # canonical casing

        if book_exists_case_insensitive(s, title=book.title, author=book.author, exclude_id=book_id):
            raise HTTPException(
                status_code=409,
                detail="Another book already exists with the same title + author (case-insensitive).",
            )

        s.commit()
        s.refresh(book)
        return book


@app.delete("/api/books/{book_id}", status_code=204)
def delete_book(book_id: int):
    with get_session() as s:
        book = s.get(Book, book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")
        s.delete(book)
        s.commit()
        return None
