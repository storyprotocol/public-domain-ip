import time
import json
from collections import defaultdict

from character_extractor.parse_by_spacy import SpacyParser
from models import Session
from models.book import Book, Chapter
from models.series import Series, SeriesBook, SeriesEntity, EntityTypeEnum


def parse_book():
    books = Book.get_all_books()
    series_map = defaultdict(list)
    for book in books:
        series = book.get_series()
        series_map[series].append(book)

    for series_name, books in series_map.items():
        has_processed = bool(Series.first_by_title(series_name))
        if has_processed:
            print(f'{series_name} already processed, skip it')
            continue

        start_time = time.time()
        print(f'parsing: {series_name}')
        chapters = Chapter.get_chapters_by_book_ids([book.id for book in books])
        parser = SpacyParser(chapters)
        result = parser.parse()
        print(f'done: {series_name}, using {time.time() - start_time} seconds')

        tags = []
        for book in books:
            tags.extend(json.loads(book.tags) or [])
        series_obj = Series(title=series_name, description=json.dumps(list(set(tags))))

        with Session() as session:
            session.add(series_obj)
            session.flush()
            for book in books:
                session.add(SeriesBook(book_id=book.id, series_id=series_obj.id))

            series_entity_objs = []
            for index, character in enumerate(list(result['PERSON'].keys())[0:50]):
                series_entity_objs.append(SeriesEntity(
                    series_id=series_obj.id,
                    type=EntityTypeEnum.Character.value,
                    name=character,
                    description=''
                ))
                if len(series_entity_objs) > 10:
                    session.bulk_save_objects(series_entity_objs)
                    series_entity_objs.clear()
            if len(series_entity_objs) > 0:
                session.bulk_save_objects(series_entity_objs)
            session.commit()
