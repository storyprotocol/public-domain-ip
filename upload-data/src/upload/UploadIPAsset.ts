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
      fileLogger.info("No ip asset need to upload.");
      return result;
    }
    try {
      for (const ipAsset of ipAssets) {
        fileLogger.info(`Upload ip asset: ${JSON.stringify(ipAsset)}`);
        switch (ipAsset.status) {
          case IP_ASSET_STATUS.CREATED:
            await this.uploadIPAsset(ipAsset);
            result.newItem++;
            break;
          case IP_ASSET_STATUS.FAILED:
            result.failedItem++;
            // TODO
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
            fileLogger.warn(`Invalid IP asset status ${ipAsset.status}`);
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
    fileLogger.info(`Fund ${ipAssets.length} IP assets.`);
    return ipAssets;
  }

  private async uploadIPAsset(item: IPAssetItem) {
    if (!item.org_address) {
      fileLogger.error(`org_address is null: ${JSON.stringify(item)}}`);
      throw new Error(`org_address is null: ${JSON.stringify(item)}}`);
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
      fileLogger.error(`uri or hash is null: ${JSON.stringify(item)}}`);
      throw new Error(`uri or hash is null: ${JSON.stringify(item)}}`);
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
        uploadFields.owner = this.clientAddress;
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
        fileLogger.error(`Invalid IP asset type ${item.type}`);
        throw new Error(`Invalid IP asset type ${item.type}`);
    }
  }

  public async generateURIByMetaData(
    item: IPAssetItem
  ): Promise<{ uri: string; hash: string }> {
    if (!item.metadata_raw || item.metadata_raw.trim().length == 0) {
      fileLogger.error(`meta_data is null: ${JSON.stringify(item)}}`);
      throw new Error(`meta_data is null: ${JSON.stringify(item)}}`);
    }
    fileLogger.info(
      `generateURIByMetaData: ${JSON.stringify(item.metadata_raw)}}`
    );
    const uri = await this.uploader.uploadText(item.metadata_raw);
    const hash = keccak256(toHex(item.metadata_raw));
    fileLogger.info(`uri: ${uri}, hash: ${hash}`);

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
      fileLogger.error(`description is null: ${JSON.stringify(item)}}`);
      throw new Error(`description is null: ${JSON.stringify(item)}}`);
    }
    if (!item.image_url || item.image_url.trim().length == 0) {
      fileLogger.error(`image_url is null: ${JSON.stringify(item)}}`);
      throw new Error(`image_url is null: ${JSON.stringify(item)}}`);
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

    await updateIPAsset(this.prisma, item.id, {
      metadata_raw: metaData,
      metadata_url: imageURI,
      // ip_hash: hash,
    });

    // return { uri, hash };
    return { uri, hash: "" };
  }
}
