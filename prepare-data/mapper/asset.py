import uuid
import json
import re

from loguru import logger

from collections import defaultdict
from models.ip_mapping import IpOrganization, IpAsset, SeriesIP
from mapper.constants import Asset_Type


class AssetHandler:
    default_ip_asset_types = json.dumps(["1", "2", "3", "4", "5", "6"])

    def __init__(self):
        self.ip_org = None
        self.ip_assets = list()
        self.__book_dict = defaultdict(list)
        self.__chapter_dict = defaultdict(list)
        self.__book_chapter_dict = defaultdict(list)
        self.__character_dict = defaultdict(list)

    def __get_symbol(self, title):
        return "".join(re.findall(r"\b\w", title)).upper()

    def __get_book_meta_data(self, book):
        # logger.info(f"process the book {book}")
        metadata_raw = json.dumps(
            {
                "auther": json.loads(book.authors),
                "publish_date": book.issued_date,
                "total_chapters": book.total_chapters,
                "source_url": book.source_url,
                "tags": json.loads(book.tags),
            }
        )
        return metadata_raw

    def __get_chapter_meta_data(self, chapter):
        metadata_raw = json.dumps({"chapter_number": chapter.chapter_num})
        return metadata_raw

    def __create_ip_asset(
        self, ip_name, ip_type, metadata_raw, description=None, image_url=None
    ):
        ip_asset = IpAsset(
            id=str(uuid.uuid4()),
            ip_organization_id=self.ip_org.id,
            name=ip_name,
            type=ip_type,
            metadata_raw=metadata_raw,
            description=description,
            image_url=image_url,
            status=0,
        )
        self.ip_assets.append(ip_asset)
        return ip_asset

    def __create_series_ip(self, series):
        series_ip = SeriesIP(
            series_id=series.id,
            ip_organization_id=self.ip_org.id,
            mapping_type="ip-org",
        )
        return series_ip

    def get_ip_org(self):
        return self.ip_org

    def get_ip_assets(self):
        return self.ip_assets

    def create_ip_organization(self, series):
        logger.info(f"process the ip_org {series.title}")
        ip_organization = IpOrganization(
            id=str(uuid.uuid4()),
            name=series.title,
            symbol=self.__get_symbol(series.title),
            ip_asset_types=self.default_ip_asset_types,
            status=0,
        )
        self.ip_org = ip_organization
        return ip_organization

    def config_book(self, series_books):
        for series_obj, book_obj in series_books:
            metadata_raw = self.__get_book_meta_data(book_obj)
            book_ip_asset = self.__create_ip_asset(
                book_obj.title, Asset_Type.BOOK.value, metadata_raw
            )
            self.__book_dict[book_obj.id].append(book_ip_asset)

    def get_book_list(self):
        return list(self.__book_dict.keys())

    def get_chapter_list(self):
        return list(self.__chapter_dict.keys())

    def get_book_ip_assets(self, book_id):
        return self.__book_dict[book_id]

    def get_chapter_ip_assets(self, chapter_id):
        return self.__chapter_dict[chapter_id]
    
    def get_chapter_ip_assets_by_book(self, book_id):
        return self.__book_chapter_dict[book_id]

    def get_character_ip_assets(self, character_id):
        return self.__character_dict[character_id]

    def config_chapter(self, chapters):
        for chapter in chapters:
            # logger.info(f"-- IP -- CHAPTER - {chapter.chapter_name}")
            metadata_raw = self.__get_chapter_meta_data(chapter)
            chapter_ip_asset = self.__create_ip_asset(
                chapter.chapter_name, Asset_Type.CHAPTER.value, metadata_raw
            )
            self.__chapter_dict[chapter.id].append(chapter_ip_asset)
            self.__book_chapter_dict[chapter.book_id].append(chapter_ip_asset)

    def config_character(self, characters):
        for series_obj, series_entity_obj, chapter_obj in characters:
            character_ip_asset = self.__create_ip_asset(
                series_entity_obj.name,
                Asset_Type.CHARACTER.value,
                None,
                series_entity_obj.description,
                series_entity_obj.image_url,
            )

            if series_entity_obj.chapter_id is not None:
                self.__character_dict[series_entity_obj.chapter_id].append(
                    character_ip_asset
                )
            else:
                for book_id in self.__book_dict.keys():
                    self.__character_dict[book_id].append(character_ip_asset)
            # logger.info(
            #     f"?? character id - {character_ip_asset.id} - ip org {self.ip_org.id}"
            # )
