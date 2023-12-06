import json
import unittest

from mapper.asset import AssetHandler


class FakeBook:
    def __init__(
        self, id, title, authors, issued_date, total_chapters, source_url, tags
    ):
        self.id = id
        self.title = title
        self.authors = authors
        self.issued_date = issued_date
        self.total_chapters = total_chapters
        self.source_url = source_url
        self.tags = tags


class FakeIpOrganization:
    def __init__(self, id, title):
        self.id = id
        self.title = title


class FakeChapter:
    def __init__(self, id, book_id, chapter_num, content):
        self.id = id
        self.book_id = book_id
        self.chapter_name = "chapter" + str(chapter_num)
        self.chapter_num = chapter_num
        self.content = content


class FakeCharacter:
    def __init__(self, id, book_id, chapter_id, name, description, image_url):
        self.id = id
        self.book_id = book_id
        self.chapter_id = chapter_id
        self.name = name
        self.description = description
        self.image_url = image_url


class TestAssetHandler(unittest.TestCase):
    def test_asset_handler(self):
        handler = AssetHandler()
        ip_org = FakeIpOrganization(1, "test org title")
        handler.create_ip_organization(ip_org)
        self.assertEqual(handler.get_ip_org().name, "test org title")
        self.assertEqual(handler.get_ip_org().symbol, "TOT")
        self.assertEqual(
            handler.get_ip_org().ip_asset_types,
            json.dumps(["1", "2", "3", "4", "5", "6"]),
        )

        series_books = [
            [
                {"id": 1},
                FakeBook(
                    101,
                    "book1",
                    '["Tom"]',
                    "2020-01-01",
                    10,
                    "url_to_book1",
                    '["tag1", "tag2"]',
                ),
            ],
            [
                {"id": 1},
                FakeBook(
                    102,
                    "book2",
                    '["Tom"]',
                    "2020-01-02",
                    20,
                    "url_to_book2",
                    '["tag3", "tag4"]',
                ),
            ],
        ]
        handler.config_book(series_books)
        self.assertEqual(handler.get_book_list(), [101, 102])
        self.assertEqual(handler.get_book_ip_assets(101)[0].name, "book1")

        series_characters = [
            [
                {"id": 1},
                FakeCharacter(10001, 101, 1001, "Tom", "Description Tom", "url_to_tom"),
                {"id": 1001},
            ],
            [
                {"id": 1},
                FakeCharacter(10002, 101, 1002, "Jim", "Description Jim", "url_to_jim"),
                {"id": 1002},
            ],
        ]
        handler.config_character(series_characters)
        # characters are grouped by the book
        ip_assets_10001 = handler.get_character_ip_assets(1001)
        self.assertEqual(len(ip_assets_10001), 1)
        self.assertEqual(ip_assets_10001[0].name, "Tom")
        self.assertEqual(ip_assets_10001[0].type, 3)
        self.assertEqual(ip_assets_10001[0].description, "Description Tom")
        self.assertEqual(ip_assets_10001[0].image_url, "url_to_tom")

        ip_assets_10002 = handler.get_character_ip_assets(1002)
        self.assertEqual(len(ip_assets_10002), 1)
        self.assertEqual(ip_assets_10002[0].name, "Jim")
        self.assertEqual(ip_assets_10002[0].type, 3)
        self.assertEqual(ip_assets_10002[0].description, "Description Jim")
        self.assertEqual(ip_assets_10002[0].image_url, "url_to_jim")

        handler.config_chapter(
            [
                FakeChapter(1001, 101, 1, "chapter1 content"),
                FakeChapter(1002, 101, 2, "chapter2 content"),
            ]
        )
        self.assertEqual(handler.get_chapter_list(), [1001, 1002])
        ip_assets_1001 = handler.get_chapter_ip_assets(1001)
        self.assertEqual(len(ip_assets_1001), 1)
        self.assertEqual(ip_assets_1001[0].name, "chapter1")
        self.assertEqual(ip_assets_1001[0].type, 2)
        self.assertEqual(ip_assets_1001[0].description, None)
        self.assertEqual(ip_assets_1001[0].image_url, None)

        ip_assets_1001_1002 = handler.get_chapter_ip_assets_by_book(101)
        self.assertEqual(len(ip_assets_1001_1002), 2)
        self.assertEqual(ip_assets_1001_1002[0].name, "chapter1")
        self.assertEqual(ip_assets_1001_1002[0].type, 2)
        self.assertEqual(ip_assets_1001_1002[0].description, None)
        self.assertEqual(ip_assets_1001_1002[0].image_url, None)

        ip_assets = handler.get_ip_assets()
        self.assertEqual(len(ip_assets), 6)
