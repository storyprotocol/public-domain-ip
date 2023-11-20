import unittest
import os

from character_extractor.utils import get_open_ai_msg, load_openai_client, lazy_load_booknlp
from exceptions import EnvError


class ParserUtilsTest(unittest.TestCase):
    def test_get_open_ai_msg(self):
        c = 'Joy'
        name = 'Joy story'
        ret = f"Describe in a short sentence what kind of character {c} is in {name}"
        self.assertEqual(get_open_ai_msg(c, name), ret)

    def test_load_openai_client(self):
        self.assertRaises(EnvError, load_openai_client)

    def test_lazy_load_booknlp(self):
        self.assertIsNotNone(lazy_load_booknlp())
