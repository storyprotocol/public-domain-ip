import os
import csv

from loguru import logger

from config import DATABASE_URL
from models.book import Book, Chapter
from models import Session
from models.series import Series, SeriesEntity, SeriesBook
from models.ip_mapping import SeriesIP, IpOrganization, IpAsset, RelationshipType, Relationship


class DataLoader:

    def __init__(self, raw_data_dir="../test-data/raw/"):
        self.root_path = raw_data_dir
        self.book_path = os.path.join(self.root_path, 'book.csv')
        self.chapter_path = os.path.join(self.root_path, 'chapter.csv')
        self.series_path = os.path.join(self.root_path, 'series.csv')
        self.series_bool_path = os.path.join(self.root_path, 'series_book.csv')
        self.series_entity_path = os.path.join(self.root_path, 'series_entity.csv')
        self.series_ip_path = os.path.join(self.root_path, 'series_ip.csv')
        self.ip_organization_path = os.path.join(self.root_path, 'ip_organization.csv')
        self.ip_asset_path = os.path.join(self.root_path, 'ip_asset.csv')
        self.relationship_type_path = os.path.join(self.root_path, 'relationship_type.csv')
        self.relationship_path = os.path.join(self.root_path, 'relationship.csv')

    @staticmethod
    def read_csv(path: str) -> [dict]:
        ret = []
        with open(path) as file:
            logger.info(f"import {path} to database {DATABASE_URL}")
            reader = csv.reader(file)
            keys = next(reader)
            for line in reader:
                line_dict = {}
                for index, key in enumerate(keys, 0):
                    if line[index] == '':
                        line_dict[key] = None
                    else:
                        line_dict[key] = line[index]
                ret.append(line_dict)
        return ret

    def _load_data(self, path, model):
        data = self.read_csv(path)
        obj_list = []
        for item in data:
            obj_list.append(model(**item))

        session = Session()
        session.add_all(obj_list)
        session.commit()

    def load(self):
        table_list = [
            (self.book_path, Book),
            (self.chapter_path, Chapter),
            (self.series_path, Series),
            (self.series_bool_path, SeriesBook),
            (self.series_entity_path, SeriesEntity),
            (self.series_ip_path, SeriesIP),
            (self.ip_organization_path, IpOrganization),
            (self.ip_asset_path, IpAsset),
            (self.relationship_type_path, RelationshipType),
            (self.relationship_path, Relationship),
        ]
        for path, model in table_list:
            self._load_data(path, model)
