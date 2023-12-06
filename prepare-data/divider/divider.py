import re

from divider.base import BaseDivider
from divider.chapter import GenericChapter
from divider.constants import IGNORE_CHAPTER_NAME
from divider.utils import (
    clean_content,
    list_to_content,
    parse_anchor_params,
    parse_content_params,
)


class GenericDivider(BaseDivider):
    def get_chapter_tags(self):
        return self.soup.find_all("div", class_=self.chapter_class)

    @staticmethod
    def need_prefix(chapter_title: str):
        keywords = ("NOTE", "FOOTNOTES", "FINALE", "EPILOGUE")
        for keyword in keywords:
            if keyword in chapter_title.upper():
                return False
        return True

    def clean_chapter_title(self, prefix, chapter_title: str):
        if not self.need_prefix(chapter_title):
            return chapter_title
        return " - ".join(filter(bool, [prefix, chapter_title]))

    def divide(self):
        chapters = self.get_chapter_tags()
        chapter_title_prefix = ""
        for chapter in chapters:
            children = chapter.find_all("div", class_=self.chapter_class)
            if children:
                continue
            c = GenericChapter(chapter)
            chapter_name = c.get_chapter_name()
            chapter_content = c.get_chapter_content()
            if (not chapter_content or len(chapter_content) < 100) and self.embedded:
                chapter_title_prefix = chapter_name
                continue
            if len(chapter_content) < 100:
                continue
            title = clean_content(
                self.clean_chapter_title(chapter_title_prefix, chapter_name)
            )
            if not title or title.upper() in IGNORE_CHAPTER_NAME:
                continue
            yield self.generate_chapter_response(chapter_content, title)


class AnchorDivider(BaseDivider):
    def __init__(self, anchor_list, anchor_roman_list=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        assert len(anchor_list) > 0
        self.anchor_list = anchor_list
        self.anchor_roman_list = anchor_roman_list or []

    def get_chapter_title(self, anchor_id):
        title_tag = self.soup.find("a", href=re.compile(f"#{anchor_id}", re.IGNORECASE))
        if title_tag is not None:
            return clean_content(title_tag.get_text())
        return ""

    def is_sep(self, tag):
        return (
            tag.get("id") in self.anchor_roman_list or tag.get("id") in self.anchor_list
        )

    def divide(self):
        current_id = self.anchor_list[0]
        try:
            tag = self.soup.find(id=current_id).find_next()
        except AttributeError:
            current_id = self.anchor_roman_list[0]
            tag = self.soup.find(id=current_id).find_next()

        ret = []
        while tag is not None:
            if self.is_end(tag) or self.is_sep(tag):
                content = list_to_content(ret)
                if content:
                    yield self.generate_chapter_response(
                        content, self.get_chapter_title(current_id)
                    )
                if self.is_end(tag):
                    break
                if self.is_sep(tag):
                    current_id = tag.get("id")
                ret = []  # new chapter or end

            cleaned_text = self.get_text_from_tag(tag)
            ret.append(cleaned_text)
            tag = tag.find_next()


class ContentDivider(BaseDivider):
    book_tag = "h2"

    def __init__(self, sep_filters=None, *args, **kwargs):
        self.sep_filters = sep_filters
        super().__init__(*args, **kwargs)

    def is_sep(self, tag):
        for key, value in self.sep_filters.items():
            tag_value = getattr(tag, key) or tag.get(key)
            if tag_value != value:
                return False

        return True

    def get_chapter_title(self, tag):
        book_name = ""
        book_tag = tag.find_previous(self.book_tag)
        if book_tag is not None:
            book_name = clean_content(book_tag.get_text())

        chapter_name = ""
        chapter_tag = tag.find_previous(**self.sep_filters)
        if chapter_tag is not None:
            chapter_name = clean_content(chapter_tag.get_text())
        return " - ".join(filter(bool, [book_name, chapter_name]))

    def divide(self):
        current_tag = self.get_start_tag()
        text_list = []
        while current_tag is not None:
            is_sep = self.is_sep(current_tag)
            if is_sep:
                content = list_to_content(text_list)
                if content:
                    yield self.generate_chapter_response(
                        content, self.get_chapter_title(current_tag)
                    )
                text_list = []
            else:
                text_list.append(self.get_text_from_tag(current_tag))

            current_tag = current_tag.find_next()

            if self.is_end(current_tag):
                content = list_to_content(text_list)
                if content:
                    yield self.generate_chapter_response(
                        content, self.get_chapter_title(current_tag)
                    )
                break


def divider_factory(book_type, url, params):
    if book_type == "1":
        return GenericDivider(url=url, embedded=params.upper() == "TRUE")
    elif book_type == "2":
        return AnchorDivider(
            url=url,
            anchor_list=parse_anchor_params(params),
            anchor_roman_list=parse_anchor_params(params, roman=True),
        )
    return ContentDivider(url=url, sep_filters=parse_content_params(params))
