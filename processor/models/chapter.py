from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship, backref

from models import Base


class Chapter(Base):
    __tablename__ = 'chapter'

    id = Column(Integer, primary_key=True, autoincrement=True)
    book_id = Column(Integer, ForeignKey('book.id'), nullable=False)
    Book = relationship('Book', backref=backref('chapters'))
    chapter_num = Column(Integer)
    chapter_name = Column(String(256))
    content = Column(Text)

    def __str__(self):
        return f'chapter: {self.id}_{self.chapter_name}'

    def __repr__(self):
        return f'chapter: {self.id}_{self.chapter_name}'
