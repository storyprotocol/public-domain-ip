# Test Data
For test purpose, we prepare some test data from 10 books in the local database. 
The user can import those data and validate the SDK functions

## Database files
The test database data are exported to csv file. 
The raw files can be found in `raw` folder

- book.csv
- chapter.csv
- series.csv
- series_book.csv
- series_entity.csv
- series_ip.csv
- ip_asset.csv
- ip_organization.csv
- relationship.csv
- relationship_type.csv

The sqlite databse file contains above data are in the file:
`local_10books.db`

## How to use raw data
You can import to other sql database (eg. PostgreSQL) or local sqlite db.
Please refer the command line tool in `prepare-data` to execute 4 steps
- Change to `prepare-data` folder and setup the environment
- Config the right database url in env `DATABASE_URL`
- Create required tables with `python app.py init-db`
- Load all data by `python app.py load-db-data -f ../test-data/raw/`


## Image files
The character images are in the folder
`images`

Please make sure the file name match with image_url in series_entity table if you want to rename them

## Book list
- book-name: The Wonderful Wizard of Oz
  - ip-org-id: 255df7f9-4ccf-4cee-9a47-970a91574325

- book-name: A Christmas Carol in Prose; Being a Ghost Story of Christmas
  - ip-org-id: 9cc8738d-74e5-49e7-aee7-e850db3f78ab

- book-name: Peter Pan
  - ip-org-id: fc1a1781-949d-4acc-87ba-d290ab8ad024

- book-name: The Jungle Book
  - ip-org-id: 135185f3-f684-4001-bbc1-d9bd637ad0eb

- book-name: Dracula
  - ip-org-id: 2781f765-d654-4eff-b866-0a084454abfb

- book-name: The Age of Innocence
  - ip-org-id: f753bac2-3138-464c-aae6-677f04d6c1aa

- book-name: Adventures of Huckleberry Finn
  - ip-org-id: aa9086f5-41a4-4c48-b6df-0b081c307c4c

- book-name: Alice's Adventures in Wonderland
  - ip-org-id: cf7a2b89-9ce9-443b-bb99-d156218614d5

- book-name: Frankenstein; Or, The Modern Prometheus
  - ip-org-id: e4135903-935b-4f20-9ba7-e1b57601eaa2

- book-name: Pride and Prejudice
  - ip-org-id: 08756108-4af5-45f9-b3f1-3eba0b7563f4

We get all the chapters and 10 characters with description from each book and mapped them to ip organizations and assets. 
In the test data we includes only 2 relationship type:  
- APPEARS_IN     (e.g. character -> APPEARS_IN -> book)
- GROUP_BY_BOOK  (e.g. chapter -> GROUP_BY_BOOK -> book)

The relationships between assets are also created. 

Above data could be found in the following tables.

- ip_organization
- ip_asset
- relationship_type
- relationship

Those test data can cover the 4 main function of uploading in the SDK.

## Set up Environment
Make sure the .env file in the `upload-data` folder refer this db (DATABASE_URL) and images path (IMAGE_PATH)
Example for rc.6
```
NODE_ENV=develop
DATABASE_URL=file:/path/to/repo/public-domain-ip/test-data/local.db
NEXT_PUBLIC_API_BASE_URL = https://stag.api.storyprotocol.net
NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT = 0xD0060D8e88DD841FD32A01B18a9C7e84A1C7d6d4
NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT= 0x309C205347E3826472643f9B7EbD8A50D64CCd9e
NEXT_PUBLIC_IP_ORG_CONTROLLER_CONTRACT = 0xd778680fD9fa788A2fd6465087e6841814eE57CC
NEXT_PUBLIC_RELATIONSHIP_MODULE_CONTRACT = 0x4231c45C32B53Ba61D8d04aD05255CCBF3E5DBD2
NEXT_PUBLIC_REGISTRATION_MODULE_CONTRACT = 0x948f67E1C4F75Bc89C5fb42147d96356fb4B359f
NEXT_PUBLIC_LICENSE_REGISTRY_CONTRACT = 0x630d6672D6C15952852ca2Ff0A355d19f259400B
NEXT_PUBLIC_MODULE_REGISTRY_CONTRACT = 0x8209442D02FB517Bdb9099E8Ade3968762F8545A
RPC_URL=https://1rpc.io/sepolia
PRIVATE_KEY=0x1234
IMAGE_PATH=path/to/repo/public-domain-ip/test-data/images/
IP_ORGS=255df7f9-4ccf-4cee-9a47-970a91574325,9cc8738d-74e5-49e7-aee7-e850db3f78ab	
```