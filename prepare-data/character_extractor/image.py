import asyncio
import base64
import os
from io import BytesIO
from loguru import logger
from PIL import Image

from character_extractor.constants import IMAGE_ROOT_FOLDER
from character_extractor.utils import generate_image_msg, load_openai_client
from models.series import SeriesEntity


def image_file_name(title, name):
    return f"{title.replace(' ', '_')}---{name.replace(' ', '_')}.jpg"


async def openai_generate_image(character: SeriesEntity, image_url):
    if character.image_url:
        return

    client = load_openai_client()

    ret = await client.images.generate(
        response_format="b64_json",
        prompt=generate_image_msg(character.description),
        model='dall-e-3',
        quality='standard', size='1024x1024'
    )

    image_data = BytesIO(base64.b64decode(ret.data[0].b64_json.encode()))
    image_data.seek(0)
    image = Image.open(image_data)
    image = image.convert('RGB')
    image_path = f"{IMAGE_ROOT_FOLDER}/{image_url}"
    image.save(image_path, quality=95)
    SeriesEntity.update_url(character.id, image_url)


async def generate():
    try:
        os.makedirs(IMAGE_ROOT_FOLDER)
    except FileExistsError:
        pass
    characters = SeriesEntity.get_all_character()
    tasks = []
    for character, series in characters:
        if character.image_url:
            logger.info(f'{character.name} in {series.title} has precessed, skip it')
            continue
        logger.info(f'generate image of {character.name} in {series.title}')
        image_url = image_file_name(series.title, character.name)
        tasks.append(openai_generate_image(character, image_url))
        if len(tasks) == 1:
            await asyncio.gather(*tasks)
            tasks.clear()
            break

    if len(tasks) > 0:
        await asyncio.gather(*tasks)
