from enum import Enum

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy import Enum as SqlalchemyEnum

from models import Base, Session


class Series(Base):
    __tablename__ = 'series'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(256))
    description = Column(String(512))

    @classmethod
    def first_by_title(cls, series_title):
        session = Session()
        result = session.query(cls).filter_by(title=series_title).first()
        session.close()
        return result


class SeriesBook(Base):
    __tablename__ = 'series_book'

    id = Column(Integer, primary_key=True, autoincrement=True)
    book_id = Column(Integer, ForeignKey('book.id'), nullable=False)
    series_id = Column(Integer, ForeignKey('series.id'), nullable=False)


class EntityTypeEnum(Enum):
    Character = 'character'
    Location = 'location'
    Etc = 'etc'


class SeriesEntity(Base):
    __tablename__ = 'series_entity'

    id = Column(Integer, primary_key=True, autoincrement=True)
    series_id = Column(Integer, ForeignKey('series.id'), nullable=False)
    type = Column(SqlalchemyEnum(EntityTypeEnum))
    name = Column(String(256))
    description = Column(String(512))
