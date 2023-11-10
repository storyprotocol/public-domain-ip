from divider.csv_reader import CsvReader
from divider.divider import divider_factory
from divider.rdf import RdfParser
from models import Session
from models.book import Book
from models.chapter import Chapter


def divide_book(csv_path):
    data = CsvReader(csv_path).read()

    for item in data:
        if Book.has_processed(item['url']):
            print(f"{item['title']} already processed, skip it")
            continue

        print(f"processing title: {item['title']}")

        divider = divider_factory(item['type'])
        chapters = [chapter for chapter in divider(url=item['url']).divide()]
        rdf_info = RdfParser(item['url'].replace('-images.html', '.rdf')).parse()
        book = Book(
            title=rdf_info['title'],
            publisher=rdf_info['publisher'],
            authors=rdf_info['author'],
            language=rdf_info['language'],
            rights=rdf_info['rights'],
            issued_date=rdf_info['issued'],
            total_chapters=len(chapters),
            total_words=sum([i['words'] for i in chapters]),
            source_url=item['url'],
            series=item['series'],
            tags=','.join(rdf_info['subjects']),
        )

        with Session() as session:
            session.add(book)
            session.flush()
            for index, chapter in enumerate(chapters, 1):
                session.add(Chapter(
                    book_id=book.id,
                    chapter_num=index,
                    chapter_name=chapter['title'],
                    content=chapter['content'],
                ))
            session.commit()

        print(f"processing title: {item['title']} done")
