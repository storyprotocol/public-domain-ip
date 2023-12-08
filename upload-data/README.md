# Data Upload

This step will read the ip data from database and upload to story protocol. Please refer `prepare-data` folder for more details of data.

## Set up environment
Create .env file to include following environment setting
### Database URL
`DATABASE_URL =`

### Story protocol setting
```
NEXT_PUBLIC_API_BASE_URL =
NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT =
NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT=
NEXT_PUBLIC_IP_ORG_CONTROLLER_CONTRACT =
NEXT_PUBLIC_RELATIONSHIP_MODULE_CONTRACT =
NEXT_PUBLIC_REGISTRATION_MODULE_CONTRACT =
NEXT_PUBLIC_LICENSE_REGISTRY_CONTRACT =
NEXT_PUBLIC_MODULE_REGISTRY_CONTRACT =
```
### Chain PRC provider
`RPC_URL =`

### Private key of the wallet
This account will also be the owner of IP data
`PRIVATE_KEY =`

### the folder path of the image to be uploaded
`IMAGE_PATH =`

### [Optional] the ids of ip orgs. 
Set the specified ip org id to be upload.
`IP_ORGS =`
If this value is not setting, All the ip orgs in database will upload to the protocol

## Install packages

run `yarn install`

## Generate prisma Model
Please update the `prisma/schema.prisma` if you use external database than sqlite db.
Update `provider = "sqlite"` to match your database drive (e.g. provider = "postgresql").

run `npx prisma generate`

## Run tests

run `./node_modules/.bin/jest --roots test`

## Upload data

run `npm run build`

run `npm run start`
