from functools import cached_property
from collections import defaultdict, OrderedDict

from character_extractor.utils import lazy_load_spacy_nlp


class SpacyParser:
    def __init__(self, chapters):
        self.chapters = chapters

    @cached_property
    def contents(self):
        return [self.clean_content(chapter.content) for chapter in self.chapters]

    @staticmethod
    def clean_content(content: str):
        return content.replace("\n", " ").replace("\u2019", "'")

    @staticmethod
    def clean_text(text: str):
        ret = text.replace("\n", " ")
        if ret.startswith("the ") or ret.startswith('The '):
            ret = ret[4:]
        return ret

    def clean_result(self, docs):
        label_maps = defaultdict(list)
        for doc in docs:
            for ent in doc.ents:
                label_maps[ent.label_].append(self.clean_text(ent.text))

        result = {}
        for label, label_values in label_maps.items():
            count_map = defaultdict(int)
            for label_value in label_values:
                count_map[label_value] += 1
            result[label] = OrderedDict(sorted(count_map.items(), key=lambda x: x[1], reverse=True))
        return result

    def run_nlp(self):
        nlp = lazy_load_spacy_nlp()
        docs = list(nlp.pipe(self.contents))
        return docs

    def parse(self):
        docs = self.run_nlp()
        return self.clean_result(docs)
