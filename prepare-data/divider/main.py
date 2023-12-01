import json
import time

from loguru import logger

from divider.csv_reader import CsvReader
from divider.divider import divider_factory
from divider.rdf import RdfParser
from models import Session
from models.book import Book, Chapter


def divide_book(csv_path):
    data = CsvReader(csv_path).read()

    for item in data:
        if Book.first_by_url(item["url"]):
            logger.info(f"{item['title']} already processed, skip it")
            continue

        logger.info(f"processing title: {item['title']}")
        divider = divider_factory(item["type"], item["url"], item["params"])
        try:
            chapters = [chapter for chapter in divider.divide()]
            rdf_url = (
                item["url"]
                .replace("-images.html.utf8", ".rdf")
                .replace("-images.html", ".rdf")
            )
            rdf_info = RdfParser(rdf_url).parse()
        except Exception as e:
            logger.error(f"error when processing {item['title']}: {e}")
            continue
        book = Book(
            title=rdf_info["title"],
            publisher=rdf_info["publisher"],
            authors=json.dumps(rdf_info["authors"] or ""),
            language=rdf_info["language"],
            rights=rdf_info["rights"],
            issued_date=rdf_info["issued"],
            total_chapters=len(chapters),
            total_words=sum([i["words"] for i in chapters]),
            source_url=item["url"],
            series=item["series"],
            tags=json.dumps(rdf_info["subjects"] or ""),
            nlp_option=item["nlp_option"],
        )

        with Session() as session:
            session.add(book)
            session.flush()
            chapter_objs = []
            for index, chapter in enumerate(chapters, 1):
                chapter_objs.append(
                    Chapter(
                        book_id=book.id,
                        chapter_num=index,
                        chapter_name=chapter["title"],
                        content=chapter["content"],
                    )
                )
            if len(chapter_objs) > 10:
                session.bulk_save_objects(chapter_objs)
                chapter_objs.clear()

            if len(chapter_objs) > 0:
                session.bulk_save_objects(chapter_objs)
            session.commit()
