from enum import Enum


class Relationship_Type(Enum):
    APPEARS_IN = 'APPEARS_IN'
    GROUP_BY_BOOK = 'GROUP_BY_BOOK'


class Asset_Type(Enum):
    BOOK = 1
    CHAPTER = 2
    CHARACTER = 3