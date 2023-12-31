# Prepare Data
This tool is a pipeline to process the listed public domain books and store the results into database. The pipeline contains following steps:

- Prepara database
- Fetch the book content and divide it into chapters.
- List the characters in the book.
- Use external service to generate description and image

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

Config the Database URL. 
If this argument is not configured, the tool will use the sqlite db in `test-data/local.db`
Please install related db drivers. For postgresql, we can install `pip install psycopg2-binary`
```shell
export DATABASE_URL=
```

Config the ChatGPT key for description and image generation.

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

If you only need a few books to do the validation, we suggest to use 4~5 books from this csv file to build your own list
```shell
python app.py divide -f tests/test.csv
```

## Extract the characters
This tool use spacy to get top characters. This step will take some time (from 1m to 10m per book) to run NLP process of each book.

```shell
python app.py process-entity
```

## Generate description and image
The description and images are required field for character asset. This tool use openAI solution to generate the description and image. You need to config the ChatGPT key in the environment and run following command.

To avoid too many API call in short time, this tool will handle 10 characters in each time.
```shell
python app.py collect-desc
```

This tool will handle 1 characters in each time. This step need to refer the above description to generate image. Please run this step after the description is ready. 
```shell
python app.py generate-image
```
The dall-e-3 may reject some request. Please adjust the descrition and retry. 

## Mapping books and entities to ip
This tool will map the book and characters to ip org and ip assets. It will also build the relationship between ip assets
```shell
python app.py map-ip
```

## Skip above processing step and import test data
This tool will load the test data from csv file into the tables. The raw data path is required.
Prease refer `test-data` folder for more information
```shell
python app.py load-db-data -f ../test-data/raw/
```

## Go to upload script
Now the ip data are ready to upload to story protocol. Please go to `upload-data folder` to continue next step

## Unittest
Run unit tests
```shell
# run test
python -m coverage run -m unittest discover tests

# show coverage
python -m coverage report
```