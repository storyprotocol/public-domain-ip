import uuid
from enum import Enum

from sqlalchemy import Column, String

from character_extractor.constants import IMAGE_ROOT_FOLDER
from models import Base, Session


class Series(Base):
    __tablename__ = "series"

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
    __tablename__ = "series_book"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    book_id = Column(String(36), nullable=False)
    series_id = Column(String(36), nullable=False)


class EntityTypeEnum(Enum):
    Character = "character"
    Location = "location"
    Etc = "etc"


class SeriesEntity(Base):
    __tablename__ = "series_entity"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    series_id = Column(String(36), nullable=False)
    book_id = Column(String(36), nullable=True)
    chapter_id = Column(String(36), nullable=True)
    type = Column(String(64))
    name = Column(String(256))
    description = Column(String(512))
    image_url = Column(String(512))

    def image_file_name(self):
        return f"{IMAGE_ROOT_FOLDER}/{self.series.title.replace(' ', '_')}---{self.name}.jpg"

    @classmethod
    def get_all_character(cls):
        session = Session()
        query = session.query(cls).filter_by(type=EntityTypeEnum.Character.value)
        ret = query.all()
        session.close()
        return ret

    @classmethod
    def update_desc(cls, pk, desc):
        session = Session()
        session.query(cls).filter_by(id=pk, type=EntityTypeEnum.Character.value).update(
            {cls.description: desc}
        )
        session.commit()
        session.close()

    @classmethod
    def update_url(cls, pk, url):
        session = Session()
        session.query(cls).filter_by(id=pk, type=EntityTypeEnum.Character.value).update(
            {cls.url: url}
        )
        session.commit()
        session.close()
