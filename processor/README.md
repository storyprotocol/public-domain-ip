# Processors
This tool is a pipeline to process the listed public domain books and store the results into database. The pipeline contains following steps:

- Prepara database
- Fetch the book content and divide it into chapters.
- List the characters in the book.
- Use external service to generate description

Each step has its command to execute seperately.

## Installation
The tool requires python 3.6+ 
Create the python venv and active the environment

```shell
python -m venv venv
source venv/bin/activate
```

Install the dependency

```shell
pip install -r requirements.txt
```

Download the model for NER

```shell
python -m spacy download en_core_web_trf
```

Config the ChatGPT key for description.

```shell
export OPENAI_API_KEY=
```

## Preparation
In current version the tool store data in the local sqlite db. Need to init it first.

```shell
python app.py init-db
```
The output file is local.db. We can use db tools to read the db content.

## Process book
The book information and some metadata are defined in a csv file. The tool will read the csv file to get required data.

```shell
python app.py divide -f tests/test.csv
```

## Extract the characters
This tool use spacy to get top characters. This step will take some time (from 1m to 10m) to run NLP process of each book.

```shell
python app.py process_entity
```

## Generate description
This is an optional step. If you have ChatGPT key, you can config it in the environment and run following command.
```shell
python app.py collection-desc
```

## Unittest
Run unit tests
```shell
# run test
python -m coverage run -m unittest discover tests

# show coverage
python -m coverage report
```