import uuid
import json

from loguru import logger

from models.ip_mapping import Relationship, RelationshipType
from mapper.constants import Relationship_Type


class RelationshipHandler:
    default_allowed_asset_types = json.dumps(["1"])

    def __init__(self, asset_handler):
        self.__asset_handler = asset_handler
        self.relationships = list()

    def get_relationships(self):
        return self.relationships

    def handle_character_book_relationships(self):
        # character -> book
        for book_id in self.__asset_handler.get_book_list():
            src_ip_assets = self.__asset_handler.get_character_ip_assets(book_id)
            if len(src_ip_assets) == 0:
                continue
            dst_ip_asset = self.__asset_handler.get_book_ip_assets(book_id)[0]
            for src_ip_asset in src_ip_assets:
                relationship_appears_in = Relationship(
                    id=str(uuid.uuid4()),
                    ip_organization_id=self.__asset_handler.get_ip_org().id,
                    relationship_type=Relationship_Type.APPEARS_IN.value,
                    src_asset_id=src_ip_asset.id,
                    dst_asset_id=dst_ip_asset.id,
                    status=0,
                )
                self.relationships.append(relationship_appears_in)

        # character -> chapter
        for chapter_id in self.__asset_handler.get_chapter_list():
            src_ip_assets = self.__asset_handler.get_character_ip_assets(chapter_id)
            if len(src_ip_assets) == 0:
                continue
            dst_ip_asset = self.__asset_handler.get_chapter_ip_assets(chapter_id)[0]
            for src_ip_asset in src_ip_assets:
                relationship_appears_in = Relationship(
                    id=str(uuid.uuid4()),
                    ip_organization_id=self.__asset_handler.get_ip_org().id,
                    relationship_type=Relationship_Type.APPEARS_IN.value,
                    src_asset_id=src_ip_asset.id,
                    dst_asset_id=dst_ip_asset.id,
                    status=0,
                )
                self.relationships.append(relationship_appears_in)

    def handle_chapter_book_relationships(self):
        for book_id in self.__asset_handler.get_book_list():
            dst_ip_asset = self.__asset_handler.get_book_ip_assets(book_id)[0]
            src_ip_assets = self.__asset_handler.get_chapter_ip_assets_by_book(book_id)
            for src_ip_asset in src_ip_assets:
                # logger.info(
                #     f"-- RelationShip -- GROUP_BY_BOOK - {dst_ip_asset.id} -> {src_ip_asset.id}"
                # )
                relationship_chapter_book = Relationship(
                    id=str(uuid.uuid4()),
                    ip_organization_id=self.__asset_handler.get_ip_org().id,
                    relationship_type=Relationship_Type.GROUP_BY_BOOK.value,
                    src_asset_id=dst_ip_asset.id,
                    dst_asset_id=src_ip_asset.id,
                    status=0,
                )
                self.relationships.append(relationship_chapter_book)

    def get_relationship_types(self):
        relationship_types = list()
        # logger.info(
        #     f"-- IP -- RELATIONSHIP_TYPE - {self.__asset_handler.get_ip_org().id}"
        # )
        # print(f"self.__asset_handler.get_ip_org().id {self.__asset_handler.get_ip_org().id}")
        for type in Relationship_Type:
            relationship_type = RelationshipType(
                id=str(uuid.uuid4()),
                ip_organization_id=self.__asset_handler.get_ip_org().id,
                relationship_type=type.value,
                related_src=1,
                related_dst=1,
                allowed_srcs=self.default_allowed_asset_types,
                allowed_dsts=self.default_allowed_asset_types,
                status=0,
            )
            relationship_types.append(relationship_type)
        return relationship_types
