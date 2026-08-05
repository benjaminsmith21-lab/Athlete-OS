"""Base types for GarminDB schema adapters."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


class UnsupportedSchemaError(Exception):
    """Raised when no adapter matches the detected GarminDB schema."""


@dataclass
class SchemaInspection:
    garmin_db_path: Path | None
    activities_db_path: Path | None
    tables: dict[str, list[str]] = field(default_factory=dict)
    garmindb_version: str | None = None

    def table_names(self) -> set[str]:
        return set(self.tables.keys())

    def columns(self, table: str) -> set[str]:
        return set(self.tables.get(table, []))


class SchemaAdapter(ABC):
    adapter_id: str = 'unknown'
    required_tables: tuple[str, ...] = ()

    @classmethod
    @abstractmethod
    def matches(cls, inspection: SchemaInspection) -> bool:
        raise NotImplementedError

    @classmethod
    @abstractmethod
    def export(cls, inspection: SchemaInspection, timezone: str) -> dict[str, Any]:
        raise NotImplementedError
