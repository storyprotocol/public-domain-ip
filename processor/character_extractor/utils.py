from openai import AsyncOpenAI

from config import OPENAI_API_KEY
from exceptions import EnvError

SPACY_NLP = None
OPENAI_CLIENT = None
BOOK_NLP = None


def lazy_load_spacy_nlp():
    global SPACY_NLP
    if SPACY_NLP is None:
        import spacy
        SPACY_NLP = spacy.load('en_core_web_trf')

    return SPACY_NLP


def lazy_load_booknlp():
    global BOOK_NLP
    if BOOK_NLP is None:
        from booknlp.booknlp import BookNLP
        BOOK_NLP = BookNLP
    return BOOK_NLP


def get_open_ai_msg(character: str, series_name: str) -> str:
    return f"Describe in a short sentence what kind of character {character} is in {series_name}"


def load_openai_client():
    global OPENAI_CLIENT
    if OPENAI_CLIENT is None:

        if OPENAI_API_KEY is None:
            raise EnvError('You must set an openai api key, env key is `OPENAI_API_KEY`')

        OPENAI_CLIENT = AsyncOpenAI(api_key=OPENAI_API_KEY)

    return OPENAI_CLIENT
