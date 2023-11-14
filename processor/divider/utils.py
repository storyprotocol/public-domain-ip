import re

from divider.constants import SPACE_STR


def get_worlds(s: str) -> int:
    return len(list(filter(lambda x: bool(x) and x != '\n', s.split(' '))))


def list_to_content(content_list) -> str:
    return '\n'.join(list(filter(lambda x: bool(x) and x != '\n', content_list)))


def clean_content(text: str):
    # remove page number [123], {123}
    processed_text = re.sub(r'\{[\d]+\}', '', text)
    processed_text = re.sub(r'\[[\d]+\]', '', processed_text)

    # Replace multiple spaces with one space
    processed_text = re.sub(r"\s+", " ", processed_text).replace("&nbsp", ' ')

    # replace newline character
    processed_text = processed_text.replace(SPACE_STR, '\n')
    processed_text = processed_text.strip()

    return processed_text


def parse_anchor_params(params: str):
    # support range anchor link{01-24}: [link01,link02,...,link24]
    pattern = r'(\w+)\{(\d{1,10})-(\d{1,10})\}'

    anchor_list = [i.strip() for i in params.split(',')]
    ret = []
    for anchor in anchor_list:
        matches = re.findall(pattern, anchor)
        if not matches:
            # not range format
            ret.append(anchor)
            continue

        prefix, start_num, end_num = matches[0]
        for i in range(int(start_num), int(end_num) + 1):
            ret.append(f'{prefix}{str(i).zfill(len(start_num))}')

    return ret
