import json
import os
import tempfile
from collections import defaultdict, OrderedDict

from character_extractor.utils import lazy_load_spacy_nlp, lazy_load_booknlp


class BaseParser:
    def __init__(self, chapters, nlp_option):
        self.chapters = chapters
        self.nlp_option = nlp_option

    @staticmethod
    def clean_text(text: str):
        ret = text.replace("\n", " ")
        if ret.startswith("the ") or ret.startswith("The "):
            ret = ret[4:]
        return ret

    @staticmethod
    def clean_content(content: str):
        return content.replace("\n", " ").replace("\u2019", "'")

    @property
    def contents(self):
        return [self.clean_content(chapter.content) for chapter in self.chapters]


class SpacyParser(BaseParser):
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
            result[label] = OrderedDict(
                sorted(count_map.items(), key=lambda x: x[1], reverse=True)
            )
        return result

    @staticmethod
    def run_nlp(contents):
        nlp = lazy_load_spacy_nlp()
        docs = list(nlp.pipe(contents))
        return docs

    def parse(self):
        ret = []
        if self.nlp_option == "CHAPTER":
            for chapter in self.chapters:
                docs = self.run_nlp([chapter.content])
                ret.append(
                    {
                        "book_id": None,
                        "chapter_id": chapter.id,
                        "result": self.clean_result(docs),
                    }
                )
            return ret
        elif self.nlp_option == "BOOK":
            book_chapter_dict = defaultdict(list)
            for chapter in self.chapters:
                book_chapter_dict[chapter.book_id].append(chapter.content)
            for bookid, contents in book_chapter_dict.items():
                docs = self.run_nlp(self.contents)
                ret.append(
                    {
                        "book_id": bookid,
                        "chapter_id": None,
                        "result": self.clean_result(docs),
                    }
                )
            return ret
        elif self.nlp_option == "SERIES":
            docs = self.run_nlp(self.contents)
            return [
                {"book_id": None, "chapter_id": None, "result": self.clean_result(docs)}
            ]


class NlpbookParser(BaseParser):
    book_id = "book_nlp_id"

    @staticmethod
    def create_tem_file():
        temp_file = tempfile.NamedTemporaryFile()
        return temp_file

    @staticmethod
    def create_tem_folder():
        temp_dir = tempfile.TemporaryDirectory()
        return temp_dir

    def run_nlp(self, content):
        book_nlp = lazy_load_booknlp()
        model_params = {"pipeline": "entity,quote,coref", "model": "small"}
        booknlp = book_nlp("en", model_params)
        tem_file = self.create_tem_file()
        tem_file.write(content.encode())
        tem_file.seek(0)
        tem_folder = self.create_tem_folder()

        booknlp.process(tem_file.name, tem_folder.name, self.book_id)

        tem_file.close()
        return tem_folder

    def get_data_from_json_file(self, result_folder):
        result = defaultdict(int)
        file_path = os.path.join(result_folder.name, self.book_id + ".book")
        with open(file_path) as f:
            data = json.load(f)
            for item in data["characters"]:
                try:
                    name = item["mentions"]["proper"][0]["n"]
                except IndexError:
                    continue
                name = self.clean_text(name)
                result[name] += item["count"]
        result_folder.cleanup()
        result = OrderedDict(sorted(result.items(), key=lambda x: x[1], reverse=True))
        return {"PERSON": result}

    def parse(self):
        ret = []
        if self.nlp_option == "CHAPTER":
            for chapter in self.chapters:
                result_folder = self.run_nlp(chapter.content)
                ret.append(
                    {
                        "book_id": chapter.book_id,
                        "chapter_id": chapter.id,
                        "result": self.get_data_from_json_file(result_folder),
                    }
                )
            return ret
        elif self.nlp_option == "BOOK":
            book_chapter_dict = defaultdict(list)
            for chapter in self.chapters:
                book_chapter_dict[chapter.book_id].append(chapter.content)

            for bookid, contents in book_chapter_dict.items():
                result_folder = self.run_nlp(" ".join(contents))
                ret.append(
                    {
                        "book_id": bookid,
                        "chapter_id": None,
                        "result": self.get_data_from_json_file(result_folder),
                    }
                )
            return ret
        elif self.nlp_option == "SERIES":
            result_folder = self.run_nlp(" ".join(self.contents))
            return [
                {
                    "book_id": None,
                    "chapter_id": None,
                    "result": self.get_data_from_json_file(result_folder),
                }
            ]
