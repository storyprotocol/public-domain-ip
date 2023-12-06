import asyncio

from loguru import logger

from character_extractor.utils import load_openai_client, generate_character_msg
from models.series import SeriesEntity


async def openai_call(character, title):
    client = load_openai_client()
    chat_completion = await client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": generate_character_msg(character.name, title),
            }
        ],
        model="gpt-3.5-turbo",
    )

    SeriesEntity.update_desc(character.id, chat_completion.choices[0].message.content)


async def collection_description():
    characters = SeriesEntity.get_all_character()
    tasks = []
    for character, series in characters:
        if character.description:
            logger.info(f'{character.name} in {series.title} has precessed, skip it')
            continue
        logger.info(f'collect description of {character.name} in {series.title}')
        tasks.append(openai_call(character, series.title))
        if len(tasks) == 10:
            await asyncio.gather(*tasks)
            tasks.clear()

    if len(tasks) > 0:
        await asyncio.gather(*tasks)
