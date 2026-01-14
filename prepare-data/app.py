import asyncio

import click

from character_extractor.description import collection_description
from character_extractor.image import generate
from character_extractor.main import parse_book
from divider.main import divide_book
from mapper.main import map_ip_asset
from models.create_table import create_table
from dataloader.loader import DataLoader


@click.group()
def main():
    pass


@main.command()
@click.option("-f", "--file", type=str, help="input a csv file path", required=True)
def divide(file):
    divide_book(file)


@main.command()
def init_db():
    create_table()


@main.command()
def process_entity():
    parse_book()


@main.command()
@click.option("--mira", is_flag=True, help="Use Mira API instead of OpenAI")
def collect_desc(mira):
    asyncio.run(collection_description(use_mira=mira))


@main.command()
def generate_image():
    asyncio.run(generate())


@main.command()
def map_ip():
    map_ip_asset()


@main.command()
@click.option("-f", "--file", type=str, help="input raw table data path", required=True)
def load_db_data(file):
    loader = DataLoader(file)
    loader.load()


if __name__ == '__main__':
    main()
