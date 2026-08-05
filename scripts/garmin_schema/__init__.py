"""GarminDB schema adapters for Athlete OS export."""

from .base import SchemaAdapter, SchemaInspection, UnsupportedSchemaError
from .schema_v1 import GarminDbSchemaV1

ADAPTERS = [GarminDbSchemaV1]

__all__ = [
    'SchemaAdapter',
    'SchemaInspection',
    'UnsupportedSchemaError',
    'GarminDbSchemaV1',
    'ADAPTERS',
]
