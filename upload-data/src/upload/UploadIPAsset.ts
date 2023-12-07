import { PrismaClient } from "@prisma/client";
import { keccak256, toHex } from "viem";
import { Client } from "@story-protocol/core-sdk/dist/declarations/src/types/client";
import { CreateIpAssetResponse } from "@story-protocol/core-sdk";

import { getIpAssets, updateIPAsset } from "../query/ipasset";
import { fileLogger } from "../utils/WLogger";
import { StoryProtocolKit } from "../components/StoryProtocolKit";
import { IPAssetItem, IPAssetUpdateFields } from "../interfaces/IIPAsset";
import { UploadTotal } from "../interfaces/IBase";
import { Uploader } from "../components/Uploader";

export const IP_ASSET_STATUS = {
  CREATED: 0,
  SENDING: 1,
  SENT: 2,
  FAILED: 3,
  FINISHED: 4,
};

export class UploadIPAsset {
  public prisma: PrismaClient;
  public client: Client;
  public uploader: Uploader;
  public clientAddress: string;

  constructor(client: Client, clientAddress: string) {
    this.prisma = new PrismaClient();
    this.client = client;
    this.uploader = new Uploader(client);
    this.clientAddress = clientAddress;
  }

  public async upload(iporg?: string): Promise<UploadTotal> {
    const result: UploadTotal = {
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    };

    const ipAssets = await this.getIPAssets(iporg);
    if (ipAssets.length == 0) {
      fileLogger.info("There are no IP assets requiring upload.");
      return result;
    }
    try {
      for (const ipAsset of ipAssets) {
        fileLogger.info(`Handling IP asset item : ${JSON.stringify(ipAsset)}`);
        switch (ipAsset.status) {
          case IP_ASSET_STATUS.CREATED:
            await this.uploadIPAsset(ipAsset);
            result.newItem++;
            break;
          case IP_ASSET_STATUS.FAILED:
            await this.handleIPAssetFailedItem(ipAsset);
            result.failedItem++;
            break;
          case IP_ASSET_STATUS.SENDING:
            await this.handleIPAssetSendingItem(ipAsset);
            result.sendingItem++;
            break;
          case IP_ASSET_STATUS.SENT:
            await this.handleIPAssetSentItem(ipAsset);
            result.sentItem++;
            break;
          default:
            fileLogger.warn(
              `The status of the IP asset is not valid: ${ipAsset.status}`
            );
        }
      }
      return result;
    } catch (e) {
      throw e;
    }
  }

  public async closeConnection() {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  private async getIPAssets(iporg?: string) {
    const ipAssets = await getIpAssets(
      this.prisma,
      IP_ASSET_STATUS.FINISHED,
      iporg
    );
    fileLogger.info(`Found ${ipAssets.length} IP asset(s).`);
    return ipAssets;
  }

  private async uploadIPAsset(item: IPAssetItem) {
    if (!item.org_address) {
      fileLogger.error(
        `The org_address field is absent or not provided: ${JSON.stringify(
          item
        )}}`
      );
      throw new Error(
        `The org_address field is absent or not provided: ${JSON.stringify(
          item
        )}}`
      );
    }

    let uploadResult: { uri: string; hash: string } | undefined;
    if (!item.metadata_url || item.metadata_url.trim().length == 0) {
      uploadResult = await this.generateUrl(item);
    }

    const uri = uploadResult?.uri || item.metadata_url;
    const hash = uploadResult?.hash || item.ip_hash;

    // if (!uri || !hash) {
    //   fileLogger.error(`uri or hash is null: ${JSON.stringify(item)}}`);
    //   throw new Error(`uri or hash is null: ${JSON.stringify(item)}}`);
    // }

    if (!uri) {
      fileLogger.error(`uri is null: ${JSON.stringify(item)}}`);
      throw new Error(`uri is null: ${JSON.stringify(item)}}`);
    }

    let txResult: CreateIpAssetResponse | undefined;
    try {
      await updateIPAsset(this.prisma, item.id, {
        status: IP_ASSET_STATUS.SENDING,
      });

      txResult = await StoryProtocolKit.createIPAsset(this.client, {
        name: item.name,
        ipAssetType: item.type,
        orgAddress: item.org_address,
        owner: item.owner || this.clientAddress,
        hash: hash,
        mediaUrl: uri || undefined,
      });
      await updateIPAsset(this.prisma, item.id, {
        asset_seq_id: txResult.ipAssetId,
        tx_hash: txResult.txHash,
        owner: this.clientAddress,
        status: IP_ASSET_STATUS.FINISHED,
      });
    } catch (e) {
      fileLogger.error(
        `Uploading the ipAsset[${item.id}] was failed : ${
          txResult?.txHash
        } : ${JSON.stringify(item)} ${e}`
      );
      let uploadFields: IPAssetUpdateFields = {
        status: IP_ASSET_STATUS.FAILED,
      };
      if (txResult && txResult.ipAssetId) {
        uploadFields.asset_seq_id = txResult.ipAssetId;
        uploadFields.tx_hash = txResult.txHash;
        uploadFields.owner = this.clientAddress;
        uploadFields.status = IP_ASSET_STATUS.SENT;
      }
      await updateIPAsset(this.prisma, item.id, uploadFields);
      throw e;
    }
  }

  private async handleIPAssetFailedItem(item: IPAssetItem) {
    // TODO ：What caused the IP asset's status to be marked as FAILED?
    //      Did the transaction fail to send, or was it sent without receiving a response?
    //      Or did an issue occur while attempting to save to the database?
  }

  private async handleIPAssetSendingItem(item: IPAssetItem) {
    // TODO : check the transaction sent or not, if not, send it again.
  }

  private async handleIPAssetSentItem(item: IPAssetItem) {
    if (item.asset_seq_id) {
      await updateIPAsset(this.prisma, item.id, {
        status: IP_ASSET_STATUS.FINISHED,
      });
      return;
    }
    // TODO : Verify whether the transaction has been minted or converted,
    //      and ensure to populate the asset_seq_id field accordingly.
  }

  private async generateUrl(
    item: IPAssetItem
  ): Promise<{ uri: string; hash: string }> {
    switch (item.type) {
      case 1: // book
      case 2: // chapter
        return this.generateURIByMetaData(item);
      case 3: // character
        return this.generateURIForCharacter(item);
      default:
        fileLogger.error(
          `The type of the IP asset is not valid : ${item.type}`
        );
        throw new Error(`The type of the IP asset is not valid : ${item.type}`);
    }
  }

  public async generateURIByMetaData(
    item: IPAssetItem
  ): Promise<{ uri: string; hash: string }> {
    if (!item.metadata_raw || item.metadata_raw.trim().length == 0) {
      fileLogger.error(
        `The meta_data field is absent or not provided : ${JSON.stringify(
          item
        )}}`
      );
      throw new Error(
        `The meta_data field is absent or not provided : ${JSON.stringify(
          item
        )}}`
      );
    }
    fileLogger.info(
      `generateURIByMetaData: ${JSON.stringify(item.metadata_raw)}}`
    );
    const uri = await this.uploader.uploadText(item.metadata_raw);
    const hash = keccak256(toHex(item.metadata_raw));
    fileLogger.info(`uri: ${uri}, hash: ${hash}`);

    // TODO : As a temporary workaround for the SDK issue, use an empty string for the hash.
    //      Once the issue is resolved, the actual hash should be utilized.
    await updateIPAsset(this.prisma, item.id, {
      metadata_url: uri,
      // ip_hash: hash,
    });

    // return { uri, hash };
    return { uri, hash: "" };
  }

  private async generateURIForCharacter(
    item: IPAssetItem
  ): Promise<{ uri: string; hash: string }> {
    fileLogger.info(`generateURIForCharacter: ${JSON.stringify(item.id)}}`);
    if (!item.description || item.description.trim().length == 0) {
      fileLogger.error(
        `The description field is absent or not provided: ${JSON.stringify(
          item
        )}}`
      );
      throw new Error(
        `The description field is absent or not provided: ${JSON.stringify(
          item
        )}}`
      );
    }
    if (!item.image_url || item.image_url.trim().length == 0) {
      fileLogger.error(
        `The image_url field is absent or not provided: ${JSON.stringify(
          item
        )}}`
      );
      throw new Error(
        `The image_url field is absent or not provided: ${JSON.stringify(
          item
        )}}`
      );
    }
    const descriptionURI = await this.uploader.uploadText(item.description);
    fileLogger.info(`descriptionURI: ${descriptionURI}`);
    const imageURI = await this.uploader.uploadImage(item.image_url);
    fileLogger.info(`imageURI: ${imageURI}`);
    const metaData = JSON.stringify({
      descriptionURI,
      imageURI,
    });
    const hash = keccak256(toHex(metaData));
    const uri = await this.uploader.uploadText(metaData);
    fileLogger.info(`uri: ${uri}, hash: ${hash}`);

    // TODO : As a temporary workaround for the SDK issue, use an empty string for the hash.
    //      Once the issue is resolved, the actual hash should be utilized.
    await updateIPAsset(this.prisma, item.id, {
      metadata_raw: metaData,
      metadata_url: imageURI,
      // ip_hash: hash,
    });

    // return { uri, hash };
    return { uri, hash: "" };
  }
}
