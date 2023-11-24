import { ClientKit, ClientKitOptions } from "../src/components/ClientKit";
import { Chain, http, Hex } from "viem";
import { sepolia } from "viem/chains";
import { Environment } from "@story-protocol/core-sdk";
import { StoryProtocolKit } from "../src/components/StoryProtocolKit";

//0xf8AFAEEa4aea8EA6f3b181E5d31e8A0aaC3a141F
async function uploadIPOrg() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined");
  }
  const privateKey: Hex = process.env.PRIVATE_KEY as Hex;
  const chain: Chain = sepolia;
  const options: ClientKitOptions = {
    privateKey,
    chain,
    env: Environment.TEST,
  };

  if (process.env.RPC_URL) {
    options.transport = http(process.env.RPC_URL);
  }

  const client = new ClientKit(options);
  const orgItem = {
    name: "org 2",
    symbol: "org-2",
    owner: "0x208f3D2C5c27411bC0165F338FC906554Cb6eBAC",
    ip_asset_types: ["story", "character"],
  };
  const response = await StoryProtocolKit.createIPOrg(client.client, orgItem);
  console.log(`response: ${JSON.stringify(response)}`);
}

// 0x830d0982601c09887f4609f55731f615d45f26bf997146ba21fceb7ce7248326
async function uploadRelationshipType() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined");
  }
  const privateKey: Hex = process.env.PRIVATE_KEY as Hex;
  const chain: Chain = sepolia;
  const options: ClientKitOptions = {
    privateKey,
    chain,
    env: Environment.TEST,
  };

  if (process.env.RPC_URL) {
    options.transport = http(process.env.RPC_URL);
  }

  const client = new ClientKit(options);
  const typeItem = {
    org_address: "0xf8AFAEEa4aea8EA6f3b181E5d31e8A0aaC3a141F",
    relationship_type: "APPEARS_IN",
    related_src: 1,
    related_dst: 1,
    allowed_srcs: [1],
    allowed_dsts: [1],
  };
  const response = await StoryProtocolKit.createIPOrgRelationType(
    client.client,
    typeItem
  );
  console.log(`response: ${JSON.stringify(response)}`);
}

// 86 0x7e12b878dbb5b9be8c03d04302605a5bf7e929ce86de9726c509693112aabe8c
// 87 0x55f2c63b32416de1686cf6c22cad17d4fdf019012cf6ffe4d4c872d0ac8602ad
async function uploadIPAsset() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined");
  }
  const privateKey: Hex = process.env.PRIVATE_KEY as Hex;
  const chain: Chain = sepolia;
  const options: ClientKitOptions = {
    privateKey,
    chain,
    env: Environment.TEST,
  };

  if (process.env.RPC_URL) {
    options.transport = http(process.env.RPC_URL);
  }

  const client = new ClientKit(options);
  const assetItem = {
    org_address: "0xf8AFAEEa4aea8EA6f3b181E5d31e8A0aaC3a141F",
    type: 1,
    name: "story b",
    owner: "0x208f3D2C5c27411bC0165F338FC906554Cb6eBAC",
    mediaUrl: "https://www.google.com",
    contentHash: "0x1234afgsw",
  };
  const response = await StoryProtocolKit.createIPAsset(
    client.client,
    assetItem
  );
  console.log(`response: ${JSON.stringify(response)}`);
}

// 39 0xbdf55484bd7cdb0691e88d1f2abb94b4df1e59680255968f918892f6cfe210cd
async function uploadRelationship() {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined");
  }
  const privateKey: Hex = process.env.PRIVATE_KEY as Hex;
  const chain: Chain = sepolia;
  const options: ClientKitOptions = {
    privateKey,
    chain,
    env: Environment.TEST,
  };

  if (process.env.RPC_URL) {
    options.transport = http(process.env.RPC_URL);
  }

  const client = new ClientKit(options);
  const relationship = {
    org_address: "0xf8AFAEEa4aea8EA6f3b181E5d31e8A0aaC3a141F",
    relationship_type: "APPEARS_IN",
    srcContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
    srcTokenId: "86",
    srcType: 1,
    dstContract: "0x177175a4b26f6EA050676F8c9a14D395F896492C",
    dstTokenId: "87",
    dstType: 1,
  };
  const response = await StoryProtocolKit.createRelationship(
    client.client,
    relationship
  );
  console.log(`response: ${JSON.stringify(response)}`);
}

async function getiporg() {
  console.log(`getiporg`);
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined");
  }
  const privateKey: Hex = process.env.PRIVATE_KEY as Hex;
  const chain: Chain = sepolia;
  const options: ClientKitOptions = {
    privateKey,
    chain,
    env: Environment.TEST,
  };

  if (process.env.RPC_URL) {
    options.transport = http(process.env.RPC_URL);
  }

  const client = new ClientKit(options);
  const iporg = await client.client.ipOrg.get({
    ipOrgId: "0x54BF09D5c3DfECaF7094708F2D3d0A7D7A824060",
  });
  console.log(`iporgs: ${JSON.stringify(iporg)}`);

  const iporgs = await client.client.ipOrg.list();
  console.log(`iporgs: ${JSON.stringify(iporgs)}`);
}

uploadRelationship()
  .then(() => {
    console.log("done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
