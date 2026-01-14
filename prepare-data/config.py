import os

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///../test-data/local.db')
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
MIRA_API_KEY = os.environ.get("MIRA_API_KEY")