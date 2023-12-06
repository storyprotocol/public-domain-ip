import uuid

from sqlalchemy import Column, Integer, String, Text

from models import Base, Session
from models.series import Series


class SeriesIP(Base):
    __tablename__ = "series_ip"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    series_id = Column(String(36), nullable=False)
    ip_organization_id = Column(String(36), nullable=False)
    mapping_type = Column(String(256))

    def __str__(self):
        return (
            f"series_ip_mapping: {self.id}_{self.series_id}_{self.ip_organization_id}"
        )

    def __repr__(self):
        return (
            f"series_ip_mapping: {self.id}_{self.series_id}_{self.ip_organization_id}"
        )

    @classmethod
    def get_unhandled_series(cls):
        session = Session()
        result = (
            session.query(Series)
            .join(
                SeriesIP,
                Series.id == SeriesIP.series_id,
                isouter=True,  # Add this to implement left outer join
            )
            .filter(SeriesIP.id == None)
            .all()
        )
        # result = session.query(cls).filter_by(source_url=url).first()
        session.close()
        return result


class IpOrganization(Base):
    __tablename__ = "ip_organization"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(256), nullable=False)
    symbol = Column(String(256))
    ip_asset_types = Column(String(256))
    org_address = Column(String(256))
    owner = Column(String(256))
    tx_hash = Column(String(256))
    status = Column(Integer)

    def __str__(self):
        return f"ip_org: {self.id}_{self.name}"

    def __repr__(self):
        return f"ip_org: {self.id}_{self.name}"


class IpAsset(Base):
    __tablename__ = "ip_asset"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ip_organization_id = Column(String(256), nullable=False)
    name = Column(String(256), nullable=False)
    type = Column(Integer)
    ip_hash = Column(String(256))
    metadata_url = Column(String(256))
    metadata_raw = Column(Text)
    description = Column(Text)
    image_url = Column(String(256))
    owner = Column(String(256))
    asset_seq_id = Column(String(256))
    tx_hash = Column(String(256))
    status = Column(Integer)

    def __str__(self):
        return f"ip_asset: {self.id}_{self.name}"

    def __repr__(self):
        return f"ip_asset: {self.id}_{self.name}"


class Relationship(Base):
    __tablename__ = "relationship"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ip_organization_id = Column(String(256), nullable=False)
    relationship_type = Column(String(256), nullable=False)
    src_asset_id = Column(String(36))
    dst_asset_id = Column(String(36))
    relationship_seq_id = Column(String(256))
    tx_hash = Column(String(256))
    status = Column(Integer)

    def __str__(self):
        return f"relationship: {self.id}_{self.ip_organization_id}_{self.relationship_type}"

    def __repr__(self):
        return f"relationship: {self.id}_{self.ip_organization_id}_{self.relationship_type}"


class RelationshipType(Base):
    __tablename__ = "relationship_type"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ip_organization_id = Column(String(256), nullable=False)
    relationship_type = Column(String(256), nullable=False)
    related_src = Column(Integer)
    related_dst = Column(Integer)
    allowed_srcs = Column(String(256))
    allowed_dsts = Column(String(256))
    tx_hash = Column(String(256))
    status = Column(Integer)

    def __str__(self):
        return f"relationship_type: {self.id}_{self.ip_organization_id}_{self.relationship_type}"

    def __repr__(self):
        return f"relationship_type: {self.id}_{self.ip_organization_id}_{self.relationship_type}"
