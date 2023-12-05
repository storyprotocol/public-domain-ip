import { Hex, http } from "viem";
import { sepolia } from "viem/chains";

import { ClientKit, ClientKitOptions } from "./components/ClientKit";
import { UploadIPOrg } from "./upload/UploadIPOrg";
import { UploadIPOrgRelationType } from "./upload/UploadIPOrgRelationType";
import { UploadIPAsset } from "./upload/UploadIPAsset";
import { UploadRelationship } from "./upload/UploadRelationship";

import { fileLogger } from "./utils/WLogger";

async function uploadAll(
  uploadIPOrg: UploadIPOrg,
  uploadIPOrgRelationType: UploadIPOrgRelationType,
  uploadIPAsset: UploadIPAsset,
  uploadRelationship: UploadRelationship
) {
  // handle ip_org
  const uploadIPOrgResult = await uploadIPOrg.upload();
  fileLogger.info(`uploadIPOrgResult: ${JSON.stringify(uploadIPOrgResult)}`);

  // handle ip_org_relation_type
  const uploadIPOrelationTypeResult = await uploadIPOrgRelationType.upload();
  fileLogger.info(
    `uploadIPOrelationTypeResult: ${JSON.stringify(
      uploadIPOrelationTypeResult
    )}`
  );

  // handle ip_asset
  const uploadIPAssetResult = await uploadIPAsset.upload();
  fileLogger.info(
    `uploadIPAssetResult: ${JSON.stringify(uploadIPAssetResult)}`
  );

  // handle relationship
  const uploadRelationshipResult = await uploadRelationship.upload();
  fileLogger.info(
    `uploadRelationshipResult: ${JSON.stringify(uploadRelationshipResult)}`
  );
}

async function uploadByIPORG(
  uploadIPOrg: UploadIPOrg,
  uploadIPOrgRelationType: UploadIPOrgRelationType,
  uploadIPAsset: UploadIPAsset,
  uploadRelationship: UploadRelationship
) {
  if (!process.env.IP_ORGS) {
    fileLogger.error("IP_ORGS is not set");
    throw new Error("IP_ORGS is not set");
  }
  const iporgs = process.env.IP_ORGS.split(",");
  fileLogger.info(`iporgs (${iporgs.length}) : ${JSON.stringify(iporgs)}`);
  for (const iporg of iporgs) {
    fileLogger.info(`Start handling iporg: ${iporg}`);

    // handle ip_org
    const uploadIPOrgResult = await uploadIPOrg.upload(iporg);
    fileLogger.info(`uploadIPOrgResult: ${JSON.stringify(uploadIPOrgResult)}`);

    // handle ip_org_relation_type
    const uploadIPOrelationTypeResult = await uploadIPOrgRelationType.upload(
      iporg
    );
    fileLogger.info(
      `uploadIPOrelationTypeResult: ${JSON.stringify(
        uploadIPOrelationTypeResult
      )}`
    );

    // handle ip_asset
    const uploadIPAssetResult = await uploadIPAsset.upload(iporg);
    fileLogger.info(
      `uploadIPAssetResult: ${JSON.stringify(uploadIPAssetResult)}`
    );

    // handle relationship
    const uploadRelationshipResult = await uploadRelationship.upload(iporg);
    fileLogger.info(
      `uploadRelationshipResult: ${JSON.stringify(uploadRelationshipResult)}`
    );

    fileLogger.info(`Finish handling iporg: ${iporg}`);
  }
}

async function main() {
  if (!process.env.PRIVATE_KEY) {
    fileLogger.error("PRIVATE_KEY is not set");
    throw new Error("PRIVATE_KEY is not set");
  }
  if (!process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT) {
    fileLogger.error("NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT is not set");
    throw new Error("NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT is not set");
  }

  const clientKitOptions: ClientKitOptions = {
    privateKey: process.env.PRIVATE_KEY as Hex,
    chain: sepolia,
    transport: process.env.RPC_URL ? http(process.env.RPC_URL) : undefined,
  };

  const clientKit = new ClientKit(clientKitOptions);
  const client = clientKit.client;
  const clientAddress = clientKit.accountAddress;

  const uploadIPOrg = new UploadIPOrg(client, clientAddress);
  const uploadIPOrgRelationType = new UploadIPOrgRelationType(client);
  const uploadIPAsset = new UploadIPAsset(client, clientAddress);
  const uploadRelationship = new UploadRelationship(client);
  try {
    if (process.env.IP_ORGS) {
      await uploadByIPORG(
        uploadIPOrg,
        uploadIPOrgRelationType,
        uploadIPAsset,
        uploadRelationship
      );
    } else {
      await uploadAll(
        uploadIPOrg,
        uploadIPOrgRelationType,
        uploadIPAsset,
        uploadRelationship
      );
    }
  } catch (e) {
    throw e;
  } finally {
    await uploadIPOrg.closeConnection();
    await uploadIPOrgRelationType.closeConnection();
    await uploadIPAsset.closeConnection();
    await uploadRelationship.closeConnection();
  }
}

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
