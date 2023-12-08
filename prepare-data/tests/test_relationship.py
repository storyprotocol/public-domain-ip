import json
import unittest

from mapper.relationship import RelationshipHandler


class FakeIpOrganization:
    def __init__(self, id, title):
        self.id = id
        self.title = title


class FakeIpAsset:
    def __init__(self, id, name, type, description, image_url):
        self.id = id
        self.name = name
        self.type = type
        self.description = description
        self.image_url = image_url


class FakeAssetHander:
    def __init__(self, book_list, chapter_list):
        self.book_list = book_list
        self.chapter_list = chapter_list

    def get_ip_org(self):
        return FakeIpOrganization(1, "test org title")
    
    def get_book_list(self):
        return self.book_list
    
    def get_chapter_list(self):
        return self.chapter_list
    
    def get_book_ip_assets(self, book_id):
        if book_id == 1:
            ip_asset_1 = FakeIpAsset(1, "book1", 1, "book1 description", "book1 image url")
            return [ip_asset_1]
        elif book_id == 2:
            ip_asset_2 = FakeIpAsset(2, "book2", 1, "book2 description", "book2 image url")
            return [ip_asset_2]
        return []

    def get_character_ip_assets(self, book_id):
        if book_id in [1]:
            ip_asset_3 = FakeIpAsset(3, "Tom", 3, "Tom description", "Tom image url")
            return [ip_asset_3]
        elif book_id in [2]:
            ip_asset_4 = FakeIpAsset(4, "Jim", 3, "Jim description", "Jim image url")
            return [ip_asset_4]
        elif book_id in [101]:
            ip_asset_13 = FakeIpAsset(13, "Tom", 3, "Tom description", "Tom image url")
            return [ip_asset_13]
        elif book_id in [102]:
            ip_asset_14 = FakeIpAsset(14, "Jim", 3, "Jim description", "Jim image url")
            return [ip_asset_14]
        else:
            return []
    
    def get_chapter_ip_assets(self, chapter_id):
        if chapter_id == 101:
            ip_asset_5 = FakeIpAsset(5, "chapter1", 2, "chapter1 description", "chapter1 image url")
            return [ip_asset_5]
        elif chapter_id == 102:
            ip_asset_6 = FakeIpAsset(6, "chapter2", 2, "chapter1 description", "chapter1 image url")
            return [ip_asset_6]

    def get_chapter_ip_assets_by_book(self, book_id):
        if book_id == 1:
            ip_asset_7 = FakeIpAsset(7, "chapter7", 2, "chapter7 description", "chapter7 image url")
            ip_asset_8 = FakeIpAsset(8, "chapter8", 2, "chapter8 description", "chapter8 image url")
            return [ip_asset_7, ip_asset_8]
        elif book_id == 2:
            ip_asset_9 = FakeIpAsset(9, "chapter9", 2, "chapter9 description", "chapter9 image url")
            ip_asset_10 = FakeIpAsset(10, "chapter10", 2, "chapter10 description", "chapter10 image url")
            return [ip_asset_9, ip_asset_10]
        else:
            return []


class TestRelationship(unittest.TestCase):
    def test_relationship_handler(self):
        asset_handler = FakeAssetHander([1, 2], [1001, 1002])
        handler = RelationshipHandler(asset_handler)
        types = handler.get_relationship_types()
        self.assertEqual(len(types), 2)
        self.assertEqual(types[0].relationship_type, "APPEARS_IN")
        self.assertEqual(types[0].related_src, 1)
        self.assertEqual(types[0].related_dst, 1)
        self.assertEqual(types[0].allowed_srcs, json.dumps([1]))
        self.assertEqual(types[0].allowed_dsts, json.dumps([1]))

        self.assertEqual(types[1].relationship_type, "GROUP_BY_BOOK")
        self.assertEqual(types[1].related_src, 1)
        self.assertEqual(types[1].related_dst, 1)
        self.assertEqual(types[1].allowed_srcs, json.dumps([1]))
        self.assertEqual(types[1].allowed_dsts, json.dumps([1]))

        handler.handle_chapter_book_relationships()
        handler.handle_character_book_relationships()
        rel_list = handler.relationships
        self.assertEqual(len(rel_list), 6)
