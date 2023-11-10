from models import Base, engine


def create_table():
    Base.metadata.create_all(engine)
