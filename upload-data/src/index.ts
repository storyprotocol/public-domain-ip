import { Environment } from "@story-protocol/core-sdk";
import { Hex, http } from "viem";
import { sepolia } from "viem/chains";

import { ClientKit, ClientKitOptions } from "./components/ClientKit";
import { UploadIPOrg } from "./upload/UploadIPOrg";
import { UploadIPOrgRelationType } from "./upload/UploadIPOrgRelationType";
import { UploadIPAsset } from "./upload/UploadIPAsset";
import { UploadRelationship } from "./upload/UploadRelationship";

import { fileLogger } from "./utils/WLogger";

const main = async () => {
  if (!process.env.PRIVATE_KEY) {
    fileLogger.error("PRIVATE_KEY is not set");
    throw new Error("PRIVATE_KEY is not set");
  }

  const clientKitOptions: ClientKitOptions = {
    privateKey: process.env.PRIVATE_KEY as Hex,
    env: Environment.TEST,
    chain: sepolia,
    transport: process.env.RPC_URL ? http(process.env.RPC_URL) : undefined,
  };

  const clientKit = new ClientKit(clientKitOptions);
  const client = clientKit.client;

  // handle ip_org
  const uploadIPOrg = new UploadIPOrg(client);
  await uploadIPOrg.upload();
  await uploadIPOrg.closeConnection();

  // handle ip_org_relation_type
  const uploadIPOrgRelationType = new UploadIPOrgRelationType(client);
  await uploadIPOrgRelationType.upload();
  await uploadIPOrgRelationType.closeConnection();

  // handle ip_asset
  const uploadIPAsset = new UploadIPAsset(client);
  await uploadIPAsset.upload();
  await uploadIPAsset.closeConnection();

  // handle relationship
  const uploadRelationship = new UploadRelationship(client);
  await uploadRelationship.upload();
  await uploadRelationship.closeConnection();
};

main()
  .then(
    () => {
      fileLogger.info("Finished");
      process.exit(0);
    },
    (err) => {
      fileLogger.error(err);
      process.exit(1);
    }
  )
  .catch((err) => {
    fileLogger.error(err);
    process.exit(1);
  });
