import re

from divider.constants import SPACE_STR


def get_worlds(s: str) -> int:
    return len(list(filter(lambda x: bool(x) and x != '\n', s.split(' '))))


def list_to_content(content_list) -> str:
    return '\n'.join(list(filter(lambda x: bool(x) and x != '\n', content_list)))


def clean_content(text: str):
    # Replace multiple spaces with one space
    processed_text = re.sub(r"\s+", " ", text).replace("&nbsp", ' ')

    # remove page number [123], {123}
    processed_text = re.sub(r'\{[\d]+\}', '', processed_text)
    processed_text = re.sub(r'\[[\d]+\]', '', processed_text)

    # replace newline character
    processed_text = processed_text.replace(SPACE_STR, '\n')
    processed_text = processed_text.strip()
    return processed_text
