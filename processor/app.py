import asyncio

import click

from character_extractor.description import collection_description
from character_extractor.main import parse_book
from divider.main import divide_book
from models.create_table import create_table


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
def parse():
    parse_book()


@main.command()
def collection_desc():
    asyncio.run(collection_description())


if __name__ == '__main__':
    main()
