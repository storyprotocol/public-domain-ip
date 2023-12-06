# Set up environment

### Database URL

DATABASE_URL =

### Story Protocol setting

NEXT_PUBLIC_API_BASE_URL =

NEXT_PUBLIC_STORY_PROTOCOL_CONTRACT =

NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT=

NEXT_PUBLIC_IP_ORG_CONTROLLER_CONTRACT =

NEXT_PUBLIC_RELATIONSHIP_MODULE_CONTRACT =

NEXT_PUBLIC_REGISTRATION_MODULE_CONTRACT =

NEXT_PUBLIC_LICENSE_REGISTRY_CONTRACT =

NEXT_PUBLIC_MODULE_REGISTRY_CONTRACT =

### Chain PRC provider

RPC_URL =

### Private key of the wallet to interact with Story Protocol SDK

PRIVATE_KEY =

### the folder path of the image to be uploaded

IMAGE_PATH =

### [Optional] the ids of ip orgs. if not setting, the all ip orgs in db will upload to chain

IP_ORGS =

# Install packages

run `yarn install`

# Generate prisma Model

run `npx prisma generate`

# Run tests

run `./node_modules/.bin/jest --roots test`

# Upload data

run `npm run build`

run `npm run start`
