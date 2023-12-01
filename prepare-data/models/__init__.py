from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from config import DATABASE_URL
Base = declarative_base()

engine = create_engine(DATABASE_URL,
                       pool_size=5,
                       max_overflow=0)

Session = sessionmaker(bind=engine)
