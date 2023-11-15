import asyncio
import unittest

import click
import coverage

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
def process_entity():
    parse_book()


@main.command()
def collection_desc():
    asyncio.run(collection_description())


@main.command()
def test():
    loader = unittest.TestLoader()
    suite = loader.discover('tests', pattern='test*.py')

    cov = coverage.Coverage()
    cov.start()

    runner = unittest.TextTestRunner()
    runner.run(suite)

    cov.stop()
    cov.report()
    cov.html_report(directory='coverage_report')


if __name__ == '__main__':
    main()
