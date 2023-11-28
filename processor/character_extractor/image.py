import asyncio
import base64
import os
from io import BytesIO

from loguru import logger
from PIL import Image

from character_extractor.utils import generate_character_msg, generate_image_msg, load_openai_client
from models.series import SeriesEntity


async def openai_generate_image(character):
    client = load_openai_client()

    chat_completion = await client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": generate_character_msg(character.name, character.series.title),
            }
        ],
        model="gpt-3.5-turbo",
    )
    logger.info(chat_completion)
    ret = await client.images.generate(
        response_format="b64_json",
        prompt=generate_image_msg(chat_completion.choices[0].message.content),
        model='dall-e-3',
        quality='standard', size='1024x1024'
    )

    out_folder = './images'
    try:
        os.makedirs(out_folder)
    except FileExistsError:
        pass

    image_data = BytesIO(base64.b64decode(ret.data[0].b64_json.encode()))
    image_data.seek(0)
    image = Image.open(image_data)
    image = image.convert('RGB')
    image.save(f'{out_folder}/{character.series.title}-{character.name}.jpg', quality=95)


async def generate():
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
