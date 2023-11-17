import uuid
from enum import Enum

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship, joinedload

from models import Base, Session


class Series(Base):
    __tablename__ = 'series'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    book_id = Column(String(36), ForeignKey('book.id'), nullable=False)
    series_id = Column(String(36), ForeignKey('series.id'), nullable=False)


class EntityTypeEnum(Enum):
    Character = 'character'
    Location = 'location'
    Etc = 'etc'


class SeriesEntity(Base):
    __tablename__ = 'series_entity'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    series_id = Column(String(36), ForeignKey('series.id'), nullable=False)
    chapter_id = Column(String(36), ForeignKey('chapter.id'), nullable=True)
    series = relationship(Series)
    type = Column(String(64))
    name = Column(String(256))
    description = Column(String(512))

    @classmethod
    def get_all_character(cls):
        session = Session()
        query = session.query(cls).filter_by(type=EntityTypeEnum.Character.value)
        ret = query.options(joinedload(SeriesEntity.series)).all()
        session.close()
        return ret

    @classmethod
    def update_desc(cls, pk, desc):
        session = Session()
        session.query(cls).filter_by(id=pk, type=EntityTypeEnum.Character.value) \
            .update({cls.description: desc})
        session.commit()
        session.close()
