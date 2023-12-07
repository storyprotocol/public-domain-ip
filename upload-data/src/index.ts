import { Hex, http } from "viem";
import { sepolia } from "viem/chains";

import { ClientKit, ClientKitOptions } from "./components/ClientKit";
import { UploadIPOrg } from "./upload/UploadIPOrg";
import { UploadIPOrgRelationType } from "./upload/UploadIPOrgRelationType";
import { UploadIPAsset } from "./upload/UploadIPAsset";
import { UploadRelationship } from "./upload/UploadRelationship";
import { getAllIpOrgs } from "./query/iporg";

import { fileLogger } from "./utils/WLogger";

async function uploadIPORG(
  uploadIPOrg: UploadIPOrg,
  uploadIPOrgRelationType: UploadIPOrgRelationType,
  uploadIPAsset: UploadIPAsset,
  uploadRelationship: UploadRelationship,
  iporg: string
) {
  fileLogger.info(`Begin processing the iporg: ${iporg}`);

  // handle ip_org
  const uploadIPOrgResult = await uploadIPOrg.upload(iporg);
  fileLogger.info(`uploadIPOrgResult: ${JSON.stringify(uploadIPOrgResult)}`);
  if (uploadIPOrgResult.failedItem > 0) {
    fileLogger.warn(
      `Uploading IP org[${iporg}] was failed. Please perform a manual verification. If you wish to re-upload, set the status to 0 and execute the script once more.`
    );
  }

  // handle ip_org_relation_type
  const uploadIPOrelationTypeResult = await uploadIPOrgRelationType.upload(
    iporg
  );
  fileLogger.info(
    `uploadIPOrelationTypeResult: ${JSON.stringify(
      uploadIPOrelationTypeResult
    )}`
  );
  if (uploadIPOrelationTypeResult.failedItem > 0) {
    fileLogger.warn(
      `Within the IP org[${iporg}], there are ${uploadIPOrelationTypeResult.failedItem} IP org relation type(s) failed to upload. Please perform a manual verification. If you wish to re-upload, set the status to 0 and execute the script once more.`
    );
  }
  // handle ip_asset
  const uploadIPAssetResult = await uploadIPAsset.upload(iporg);
  fileLogger.info(
    `uploadIPAssetResult: ${JSON.stringify(uploadIPAssetResult)}`
  );
  if (uploadIPAssetResult.failedItem > 0) {
    fileLogger.warn(
      `Within the IP org[${iporg}], there are ${uploadIPAssetResult.failedItem} IP asset(s) failed to upload. Please perform a manual verification. If you wish to re-upload, set the status to 0 and execute the script once more.`
    );
  }

  // handle relationship
  const uploadRelationshipResult = await uploadRelationship.upload(iporg);
  fileLogger.info(
    `uploadRelationshipResult: ${JSON.stringify(uploadRelationshipResult)}`
  );
  if (uploadRelationshipResult.failedItem > 0) {
    fileLogger.warn(
      `Within the IP org[${iporg}], there are ${uploadRelationshipResult.failedItem} relationship(s) failed to upload. Please perform a manual verification. If you wish to re-upload, set the status to 0 and execute the script once more.`
    );
  }

  fileLogger.info(`Complete the processing of iporg: ${iporg}`);
}

async function uploadAll(
  uploadIPOrg: UploadIPOrg,
  uploadIPOrgRelationType: UploadIPOrgRelationType,
  uploadIPAsset: UploadIPAsset,
  uploadRelationship: UploadRelationship
) {
  const iporgs = await getAllIpOrgs(uploadIPOrg.prisma);
  if (iporgs.length == 0) {
    fileLogger.info("There are no IP orgs requiring upload.");
    return;
  }

  for (const iporg of iporgs) {
    const ipOrgId = iporg.id;
    await uploadIPORG(
      uploadIPOrg,
      uploadIPOrgRelationType,
      uploadIPAsset,
      uploadRelationship,
      ipOrgId
    );
  }
}

async function uploadByIPORG(
  uploadIPOrg: UploadIPOrg,
  uploadIPOrgRelationType: UploadIPOrgRelationType,
  uploadIPAsset: UploadIPAsset,
  uploadRelationship: UploadRelationship
) {
  if (!process.env.IP_ORGS) {
    fileLogger.error(
      "The environment variable IP_ORGS has not been configured."
    );
    throw new Error(
      "The environment variable IP_ORGS has not been configured."
    );
  }
  const iporgs = process.env.IP_ORGS.split(",");
  fileLogger.info(
    `Found ${iporgs.length} iporg(s) : ${JSON.stringify(iporgs)}`
  );
  for (const iporg of iporgs) {
    await uploadIPORG(
      uploadIPOrg,
      uploadIPOrgRelationType,
      uploadIPAsset,
      uploadRelationship,
      iporg
    );
  }
}

async function main() {
  if (!process.env.PRIVATE_KEY) {
    fileLogger.error(
      "The environment variable PRIVATE_KEY has not been configured."
    );
    throw new Error(
      "The environment variable PRIVATE_KEY has not been configured."
    );
  }
  if (!process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT) {
    fileLogger.error(
      "The environment variable NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT has not been configured."
    );
    throw new Error(
      "The environment variable NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT has not been configured."
    );
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
      fileLogger.info("Upload done.");
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
