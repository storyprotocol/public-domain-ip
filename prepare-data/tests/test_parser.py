import json
import os
import unittest
from unittest import mock

from character_extractor.parser import SpacyParser, NlpbookParser


class FakeChapter:
    def __init__(self, id, book_id, content):
        self.id = id
        self.book_id = book_id
        self.content = content


class FakeBooknlp:
    def __init__(self, en, params):
        pass

    def process(self, input_name, folder_name, book_id):
        json_path = os.path.join(folder_name, book_id + '.book')
        ret = {
            'characters': [{
                'count': 2,
                'mentions': {'proper': [
                    {'n': 'Mary'}
                ]}
            }]
        }
        with open(json_path, 'w') as f:
            json.dump(ret, f)


class TestParser(unittest.TestCase):
    def test_spacy_parser(self):
        parser = SpacyParser([FakeChapter(1, 101, 'who are you? i am Joy')], "SERIES")
        ret = parser.parse()
        self.assertIsNone(ret[0]['chapter_id'])
        self.assertEqual(ret[0]['result']['PERSON']['Joy'], 1)

        parser = SpacyParser([
            FakeChapter(1, 102, 'who are you? i am Blob'),
            FakeChapter(2, 102, 'who are you? i am Mary')], "CHAPTER")
        ret = parser.parse()

        self.assertEqual(ret[0]['chapter_id'], 1)
        self.assertEqual(ret[0]['result']['PERSON']['Blob'], 1)

        self.assertEqual(ret[1]['chapter_id'], 2)
        self.assertEqual(ret[1]['result']['PERSON']['Mary'], 1)

        parser = SpacyParser([
            FakeChapter(3, 103, 'who are you? i am Blob'),
            FakeChapter(4, 104, 'who are you? i am Mary')], "BOOK")
        ret = parser.parse()

        self.assertEqual(ret[0]['book_id'], 103)
        self.assertIsNone(ret[0]['chapter_id'])
        self.assertEqual(ret[0]['result']['PERSON']['Blob'], 1)

        self.assertEqual(ret[1]['book_id'], 104)
        self.assertIsNone(ret[1]['chapter_id'])
        self.assertEqual(ret[1]['result']['PERSON']['Mary'], 1)

    @mock.patch('character_extractor.parser.lazy_load_booknlp')
    def test_booknlp_parser(self, mock_lazy_load_booknlp):
        mock_lazy_load_booknlp.return_value = FakeBooknlp
        parser = NlpbookParser([FakeChapter(1, 101, 'who are you? I am Joy')], "SERIES")
        ret = parser.parse()
        self.assertIsNone(ret[0]['chapter_id'])
        self.assertEqual(ret[0]['result']['PERSON']['Mary'], 2)

        parser = NlpbookParser([
            FakeChapter(1, 102, 'who are you? I am Joy'),
            FakeChapter(2, 102, 'who are you? I am Joy')], "CHAPTER")
        ret = parser.parse()

        self.assertEqual(ret[0]['chapter_id'], 1)
        self.assertEqual(ret[0]['result']['PERSON']['Mary'], 2)

        self.assertEqual(ret[1]['chapter_id'], 2)
        self.assertEqual(ret[1]['result']['PERSON']['Mary'], 2)

        parser = NlpbookParser([
            FakeChapter(3, 103, 'who are you? I am Joy'),
            FakeChapter(4, 104, 'who are you? I am Joy')], "BOOK")
        ret = parser.parse()

        self.assertEqual(ret[0]['book_id'], 103)
        self.assertIsNone(ret[0]['chapter_id'])
        self.assertEqual(ret[0]['result']['PERSON']['Mary'], 2)

        self.assertEqual(ret[1]['book_id'], 104)
        self.assertIsNone(ret[1]['chapter_id'])
        self.assertEqual(ret[1]['result']['PERSON']['Mary'], 2)
