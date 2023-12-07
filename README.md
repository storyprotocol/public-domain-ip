# public-domain-ip
The public domain ip project provides a series of tools to prepare and upload ip assets of public domain books into story protocol.

## Prepare Data
The scripts in `prepare-data` folder focus on the ip related data preparation.  It download the book, extract characters and map those data to IP asset. All the data will be store in the database for the next step

## Upload Data
The scripts in `upload-data` folder focus on the ip uploading to story protocol via SDK. This tool reads the IP organizations, IP assets, relationship types and relationships from database. It upload the metadata to the storage and upload IP data by the IP organization.

## Test Data
The files in `test-data` includes database and images of test ip assets for select 10 books. It will help to directly validate the upload workflow.