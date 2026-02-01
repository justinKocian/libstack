import os
import sys
from typing import Optional

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://app:app@db:5432/app")
SEED = os.getenv("SEED", "0") == "1"


# --- Models (must match main.py schema exactly) ---
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


def main():
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

    print(f"[db_reset] Using DATABASE_URL={DATABASE_URL}")
    print("[db_reset] Dropping tables...")
    Base.metadata.drop_all(engine)

    print("[db_reset] Creating tables...")
    Base.metadata.create_all(engine)

    if not SEED:
        print("[db_reset] Done (no seed). Set SEED=1 to insert sample data.")
        return 0

    print("[db_reset] Seeding sample authors and books...")

    seed_authors = [
        "Ursula K. Le Guin",
        "Octavia E. Butler",
        "Frank Herbert",
        "Mary Shelley",
    ]

    seed_books = [
        ("A Wizard of Earthsea", "Ursula K. Le Guin"),
        ("The Left Hand of Darkness", "Ursula K. Le Guin"),
        ("Kindred", "Octavia E. Butler"),
        ("Dune", "Frank Herbert"),
        ("Frankenstein", "Mary Shelley"),
    ]

    # Use raw SQL to keep this file dependency-free and predictable
    with engine.begin() as conn:
        for name in seed_authors:
            conn.execute(text("INSERT INTO authors (name) VALUES (:name)"), {"name": name})

        for title, author in seed_books:
            conn.execute(
                text("INSERT INTO books (title, author) VALUES (:title, :author)"),
                {"title": title, "author": author},
            )

    print("[db_reset] Done (seeded).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
