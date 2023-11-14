import os

from openai import AsyncOpenAI

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///local.db')
OPENAI_CLIENT = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
