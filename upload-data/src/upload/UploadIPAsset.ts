import { PrismaClient } from "@prisma/client";
import { Client } from "@story-protocol/core-sdk/dist/declarations/src/types/client";
import { CreateIpAssetResponse } from "@story-protocol/core-sdk";

import { getIpAssets, updateIPAsset } from "../query/ipasset";
import { fileLogger } from "../utils/WLogger";
import { StoryProtocolKit } from "../components/StoryProtocolKit";
import { IPAssetItem, IPAssetUpdateFields } from "../interfaces/IIPAsset";
import { UploadTotal } from "../interfaces/IBase";

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

  constructor(client: Client) {
    this.prisma = new PrismaClient();
    this.client = client;
  }

  public async upload(): Promise<UploadTotal> {
    const result: UploadTotal = {
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    };

    const ipAssets = await this.getIPAssets();
    if (ipAssets.length == 0) {
      fileLogger.info("No ip asset need to upload.");
      return result;
    }
    try {
      for (const ipAsset of ipAssets) {
        switch (ipAsset.status) {
          case IP_ASSET_STATUS.CREATED:
            this.uploadIPAsset(ipAsset);
            break;
          case IP_ASSET_STATUS.FAILED:
            this.uploadIPAsset(ipAsset);
            break;
          case IP_ASSET_STATUS.SENDING:
            this.handleIPAssetSendingItem(ipAsset);
            break;
          case IP_ASSET_STATUS.SENT:
            this.handleIPAssetSentItem(ipAsset);
            break;
          default:
            fileLogger.warn(`Invalid IP asset status ${ipAsset.status}`);
        }
      }
    } catch (e) {
      throw e;
    } finally {
      return result;
    }
  }

  public async closeConnection() {
    if (this.prisma) {
      await this.prisma.$disconnect();
    }
  }

  private async getIPAssets() {
    const ipAssets = await getIpAssets(this.prisma, IP_ASSET_STATUS.FINISHED);
    fileLogger.info(`Fund ${ipAssets.length} IP assets.`);
    return ipAssets;
  }

  private async uploadIPAsset(item: IPAssetItem) {
    if (!item.org_address) {
      fileLogger.error(`org_address is null: ${JSON.stringify(item)}}`);
      return;
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
        owner: item.owner,
        hash: item.ip_hash,
        mediaUrl: item.url || "",
      });
      await updateIPAsset(this.prisma, item.id, {
        asset_seq_id: txResult.ipAssetId,
        tx_hash: txResult.txHash,
        status: IP_ASSET_STATUS.FINISHED,
      });
    } catch (e) {
      fileLogger.error(
        `Failed to upload ipAsset ${item.id}:${
          txResult?.txHash
        }:${JSON.stringify(item)} ${e}`
      );
      let uploadFields: IPAssetUpdateFields = {
        status: IP_ASSET_STATUS.FAILED,
      };
      if (txResult && txResult.ipAssetId) {
        uploadFields.asset_seq_id = txResult.ipAssetId;
        uploadFields.tx_hash = txResult.txHash;
        uploadFields.status = IP_ASSET_STATUS.SENT;
      }
      await updateIPAsset(this.prisma, item.id, uploadFields);
      throw e;
    }
  }

  private async handleIPAssetSendingItem(item: IPAssetItem) {
    // TODO
  }

  private async handleIPAssetSentItem(item: IPAssetItem) {
    if (item.asset_seq_id) {
      await updateIPAsset(this.prisma, item.id, {
        status: IP_ASSET_STATUS.FINISHED,
      });
    }
  }
}
