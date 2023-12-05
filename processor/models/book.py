import uuid

from sqlalchemy import Column, Integer, String, Text

from models import Base, Session


class Book(Base):
    __tablename__ = "book"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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
    nlp_option = Column(String(64))

    def __str__(self):
        return f"book: {self.id}_{self.title}"

    def __repr__(self):
        return f"book: {self.id}_{self.title}"

    @classmethod
    def first_by_url(cls, url):
        session = Session()
        result = session.query(cls).filter_by(source_url=url).first()
        session.close()
        return result

    @classmethod
    def get_all_books(cls, with_chapter=False):
        session = Session()
        query = session.query(cls)
        # if with_chapter:
        #     query = query.options(subqueryload(Book.chapters))
        result = query.all()
        session.close()
        return result

    def get_chapters(self):
        session = Session()
        ret = (
            session.query(Chapter)
            .filter_by(book_id=self.id)
            .order_by("chapter_num")
            .all()
        )
        session.close()
        return ret

    def get_series(self):
        return self.series or self.title


class Chapter(Base):
    __tablename__ = "chapter"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    book_id = Column(String(36), nullable=False)
    chapter_num = Column(Integer)
    chapter_name = Column(String(512))
    content = Column(Text)

    def __str__(self):
        return f"chapter: {self.id}_{self.chapter_name}"

    def __repr__(self):
        return f"chapter: {self.id}_{self.chapter_name}"

    @classmethod
    def get_chapters_by_book_ids(cls, book_ids):
        session = Session()
        ret = (
            session.query(cls)
            .filter(cls.book_id.in_(book_ids))
            .order_by("book_id", "chapter_num")
            .all()
        )
        session.close()
        return ret
