from loguru import logger

from mapper.asset import AssetHandler
from mapper.relationship import RelationshipHandler
from models import Session
from models.book import Chapter
from models.series import Series
from models.ip_mapping import (
    SeriesIP,
)


def map_ip_asset():
    unhandled_series = SeriesIP.get_unhandled_series()

    for series in unhandled_series:
        asset = AssetHandler()
        relationship_handler = RelationshipHandler(asset)
        # logger.info(f"\nSeries {series.title} {series.id}")

        ip_organization = asset.create_ip_organization(series)
        series_ip = SeriesIP(
            series_id=series.id,
            ip_organization_id=ip_organization.id,
            mapping_type="ip-org",
        )

        # config book, chapter, character in the asset
        asset.config_book(Series.get_series_books(series.id))
        asset.config_character(Series.get_series_characters(series.id))
        asset.config_chapter(Chapter.get_chapters_by_book_ids(asset.get_book_list()))

        # handle relationships
        relationship_handler.handle_character_book_relationships()
        relationship_handler.handle_chapter_book_relationships()

        with Session() as session:
            session.add(asset.get_ip_org())
            session.flush()
            session.bulk_save_objects(relationship_handler.get_relationship_types())
            session.flush()
            session.add(series_ip)
            session.flush()
            session.bulk_save_objects(asset.get_ip_assets())
            session.flush()
            session.bulk_save_objects(relationship_handler.get_relationships())
            session.commit()
