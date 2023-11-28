import asyncio
import base64
import os
from io import BytesIO

from PIL import Image

from character_extractor.constants import IMAGE_ROOT_FOLDER
from character_extractor.utils import generate_image_msg, load_openai_client
from models.series import SeriesEntity


async def openai_generate_image(character: SeriesEntity):
    if character.url:
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
    image.save(character.image_file_name(), quality=95)
    SeriesEntity.update_url(character.id, character.image_file_name()[5:])


async def generate():
    try:
        os.makedirs(IMAGE_ROOT_FOLDER)
    except FileExistsError:
        pass
    characters = SeriesEntity.get_all_character()
    tasks = []
    for character in characters:
        tasks.append(openai_generate_image(character))
        if len(tasks) == 1:
            await asyncio.gather(*tasks)
            tasks.clear()
            break

    if len(tasks) > 0:
        await asyncio.gather(*tasks)
