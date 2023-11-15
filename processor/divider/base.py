import abc
import re
from functools import cached_property

import requests
from bs4 import BeautifulSoup

from divider.constants import SPACE_STR
from divider.utils import clean_content, get_worlds


class BaseDivider(metaclass=abc.ABCMeta):
    START_TAG_ID = 'pg-header'
    END_TAG_ID = 'pg-footer'

    def __init__(self, url=None, embedded=False, chapter_class='chapter'):
        self.embedded = embedded
        self.chapter_class = chapter_class
        self.url = url

    @cached_property
    def soup(self):
        response = requests.get(self.url)
        return BeautifulSoup(response.text.replace("<br>", SPACE_STR).replace('<br/>', SPACE_STR), 'html.parser')

    def get_start_tag(self):
        start_section = self.soup.find(id=re.compile(self.START_TAG_ID, re.IGNORECASE))
        return start_section.find_next_sibling()

    @staticmethod
    def get_text_from_tag(tag):
        if tag.name not in ('p', 'span', 'i', 'pre'):
            return ''

        if tag.parent.name in ('p', 'span', 'i', 'pre', 'td'):
            return ''
        return clean_content(tag.get_text())

    @staticmethod
    def generate_chapter_response(content: str, title: str):
        return {
            'title': title,
            'content': content,
            'words': get_worlds(content)
        }

    def is_end(self, tag):
        return tag and tag.get('id') == self.END_TAG_ID

    @abc.abstractmethod
    def divide(self):
        pass


class BaseChapter(metaclass=abc.ABCMeta):

    def __init__(self, soup):
        self.soup = soup

    @abc.abstractmethod
    def get_chapter_name(self) -> str:
        pass

    @abc.abstractmethod
    def get_chapter_content(self) -> str:
        pass
