import asyncio

from loguru import logger

from character_extractor.utils import get_open_ai_msg
from config import OPENAI_CLIENT
from models.series import SeriesEntity


async def openai_call(character):
    chat_completion = await OPENAI_CLIENT.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": get_open_ai_msg(character.name, character.series.title),
            }
        ],
        model="gpt-3.5-turbo",
    )

    SeriesEntity.update_desc(character.id, chat_completion.choices[0].message.content)


async def collection_description():
    characters = SeriesEntity.get_all_character()
    tasks = []
    for character in characters:
        if character.description:
            logger.info(f'{character.name} in {character.series.title} has precessed, skip it')
            continue
        tasks.append(openai_call(character))
        if len(tasks) == 10:
            await asyncio.gather(*tasks)
            tasks.clear()

    if len(tasks) > 0:
        await asyncio.gather(*tasks)
