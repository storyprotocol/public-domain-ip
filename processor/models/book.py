from sqlalchemy import Column, Integer, String, BOOLEAN, Text

from models import Base, Session


class Book(Base):
    __tablename__ = 'book'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(256))
    publisher = Column(String(256))
    authors = Column(String(256))
    language = Column(String(64))
    rights = Column(String(256))
    issued_date = Column(String(256))
    total_chapters = Column(Integer)
    total_words = Column(Integer)
    source_url = Column(String(256))
    series = Column(String(256))
    tags = Column(Text)
    genre = Column(Text)

    def __str__(self):
        return f'book: {self.id}_{self.title}'

    def __repr__(self):
        return f'book: {self.id}_{self.title}'

    @classmethod
    def has_processed(cls, url):
        session = Session()
        result = session.query(cls).filter_by(source_url=url).first()
        return bool(result)
