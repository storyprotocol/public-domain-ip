from loguru import logger

from character_extractor.utils import generate_character_msg, generate_image_msg, load_openai_client


async def openai_generate_image():
    client = load_openai_client()

    chat_completion = await client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": generate_character_msg('Peter', "Peter Pan"),
            }
        ],
        model="gpt-3.5-turbo",
    )
    logger.info(chat_completion)
    ret = await client.images.generate(
        prompt=generate_image_msg(chat_completion.choices[0].message.content),
        model='dall-e-3',
        quality='standard', size='1024x1024'
    )
    logger.info(ret)


async def generate():
    await openai_generate_image()
