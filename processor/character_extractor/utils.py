SPACY_NLP = None


def lazy_load_spacy_nlp():
    global SPACY_NLP
    if SPACY_NLP is None:
        import spacy
        SPACY_NLP = spacy.load('en_core_web_trf')

    return SPACY_NLP


def get_open_ai_msg(character: str, series_name: str) -> str:
    return f"Describe in a short sentence what kind of character {character} is in {series_name}"
