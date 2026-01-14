import asyncio
from loguru import logger
from mira_network import MiraSyncClient
from mira_network.models import AiRequest, Message

from character_extractor.utils import load_openai_client, generate_character_msg
from models.series import SeriesEntity
from config import MIRA_API_KEY

def load_mira_client():
    return MiraSyncClient(
        api_key=MIRA_API_KEY,
        base_url="https://api.mira.network"
    )

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

def mira_call(character, title):
    client = load_mira_client()
    with client:
        request = AiRequest(
            messages=[
                Message(
                    role="user",
                    content=generate_character_msg(character.name, title)
                )
            ],
            model="deepseek-r1",
            stream=False
        )
        response = client.generate(request)
        # Handle Mira's response format which includes a 'data' wrapper
        if isinstance(response, dict):
            if 'data' in response and 'choices' in response['data']:
                description = response['data']['choices'][0]['message']['content']
                SeriesEntity.update_desc(character.id, description)
            else:
                logger.error(f"Unexpected response format from Mira API: {response}")
        else:
            logger.error(f"Unexpected response type from Mira API: {type(response)}")

async def collection_description(use_mira=False):
    characters = SeriesEntity.get_all_character()
    tasks = []
    
    for character, series in characters:
        if character.description:
            logger.info(f'{character.name} in {series.title} has been processed, skip it')
            continue
            
        logger.info(f'collect description of {character.name} in {series.title}')
        
        if use_mira:
            # For Mira, we'll run synchronously since we're using MiraSyncClient
            mira_call(character, series.title)
        else:
            tasks.append(openai_call(character, series.title))
            if len(tasks) == 10:
                await asyncio.gather(*tasks)
                tasks.clear()

    if not use_mira and len(tasks) > 0:
        await asyncio.gather(*tasks)

if __name__ == "__main__":
    # Example usage
    import sys
    use_mira = "--mira" in sys.argv
    asyncio.run(collection_description(use_mira=use_mira))
