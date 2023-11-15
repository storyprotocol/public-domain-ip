from divider.base import BaseChapter
from divider.utils import clean_content


class GenericChapter(BaseChapter):
    def get_chapter_content(self) -> str:
        selected_tags = self.soup.select('p, pre, i')
        ret = []
        for tag in selected_tags:
            # Embedded text labels
            if tag.parent.name == 'p':
                continue

            # Text description of the illustration
            if tag.parent.get('class') and 'fig' in tag.parent.get('class'):
                continue

            content = tag.get_text()
            if tag.name != 'pre':
                content = content.replace('\r\n', ' ').replace('\n', ' ')
            ret.append(clean_content(content))
        return '\n'.join(ret)

    def get_chapter_name(self) -> str:
        h2 = self.soup.find('h2')
        h3 = self.soup.find('h3')
        if h2 is not None:
            return clean_content(h2.get_text())
        if h3 is not None:
            return clean_content(h3.get_text())

        return ''
