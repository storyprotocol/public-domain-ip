import click

from divider.main import divide_book
from models.create_table import create_table


@click.group()
def main():
    pass


@main.command()
@click.option("-f", "--file", type=str, help="input a csv file path")
def divide(file):
    divide_book(file)


@main.command()
def init_db():
    create_table()


if __name__ == '__main__':
    main()
