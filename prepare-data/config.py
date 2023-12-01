import os

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///../local.db')
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
