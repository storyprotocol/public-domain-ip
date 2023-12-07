import { PrismaClient } from "@prisma/client";
import { Client } from "@story-protocol/core-sdk/dist/declarations/src/types/client";
import { CreateIPOrgResponse } from "@story-protocol/core-sdk";

import { getIpOrgs, updateIPOrg } from "../query/iporg";
import { fileLogger } from "../utils/WLogger";
import { IPOrgItem } from "../interfaces/IIPOrg";
import { StoryProtocolKit } from "../components/StoryProtocolKit";
import { UploadTotal } from "../interfaces/IBase";
import { IPOrgUpdateFields } from "../interfaces/IIPOrg";

export const IP_ORG_STATUS = {
  CREATED: 0,
  SENDING: 1,
  SENT: 2,
  FAILED: 3,
  FINISHED: 4,
};

export class UploadIPOrg {
  public prisma: PrismaClient;
  public client: Client;
  public clientAddress: string;

  constructor(client: Client, clientAddress: string) {
    this.prisma = new PrismaClient();
    this.client = client;
    this.clientAddress = clientAddress;
  }

  public async upload(iporg?: string): Promise<UploadTotal> {
    const ipOrgs = await this.getIPOrgs(iporg);
    const result: UploadTotal = {
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    };
    if (ipOrgs.length == 0) {
      fileLogger.info("There are no IP orgs requiring upload.");
      return result;
    }
    try {
      for (const ipOrg of ipOrgs) {
        const ipOrgItem: IPOrgItem = {
          ...ipOrg,
          owner: ipOrg.owner || undefined,
          ip_asset_types:
            ipOrg.ip_asset_types.length > 0
              ? JSON.parse(ipOrg.ip_asset_types)
              : ["1", "2", "3", "4", "5", "6"],
        };
        fileLogger.info(`Handling IP org item: ${JSON.stringify(ipOrgItem)}`);
        switch (ipOrg.status) {
          case IP_ORG_STATUS.CREATED:
            await this.uploadIPOrgItem(ipOrgItem);
            result.newItem++;
            break;
          case IP_ORG_STATUS.FAILED:
            await this.handleFailedIPOrgItem(ipOrgItem);
            result.failedItem++;
            break;
          case IP_ORG_STATUS.SENDING:
            await this.handleSendingIPOrgItem(ipOrgItem);
            result.sendingItem++;
            break;
          case IP_ORG_STATUS.SENT:
            await this.handleSentIPOrgItem(ipOrgItem);
            result.sentItem++;
            break;
          default:
            fileLogger.warn(
              `The status of the IP org is not valid: ${ipOrg.status}`
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

  public async getIPOrgs(iporg?: string) {
    const ipOrgs = await getIpOrgs(this.prisma, IP_ORG_STATUS.FINISHED, iporg);
    fileLogger.info(`Found ${ipOrgs.length} ipOrg(s).`);
    return ipOrgs;
  }

  private async uploadIPOrgItem(item: IPOrgItem) {
    let txResult: CreateIPOrgResponse | undefined;
    try {
      await updateIPOrg(this.prisma, item.id, {
        status: IP_ORG_STATUS.SENDING,
      });

      txResult = await StoryProtocolKit.createIPOrg(this.client, {
        name: item.name,
        symbol: item.symbol,
        owner: item.owner || this.clientAddress,
        assetTypes: item.ip_asset_types,
      });

      await updateIPOrg(this.prisma, item.id, {
        org_address: txResult.ipOrgId,
        tx_hash: txResult.txHash,
        owner: this.clientAddress,
        status: IP_ORG_STATUS.FINISHED,
      });
    } catch (e) {
      fileLogger.error(
        `Uploading the IP Org[${item.id}] was failed :${
          txResult?.txHash
        }:${JSON.stringify(item)} ${e}`
      );
      let uploadFields: IPOrgUpdateFields = { status: IP_ORG_STATUS.FAILED };
      if (txResult && txResult.ipOrgId) {
        uploadFields.org_address = txResult.ipOrgId;
        uploadFields.tx_hash = txResult.txHash;
        uploadFields.owner = this.clientAddress;
        uploadFields.status = IP_ORG_STATUS.SENT;
      }
      await updateIPOrg(this.prisma, item.id, uploadFields);
      throw e;
    }
  }

  private async handleFailedIPOrgItem(item: IPOrgItem) {
    // TODO: handleFailedIPOrgItem
  }

  private async handleSendingIPOrgItem(item: IPOrgItem) {
    // TODO: handleSendingIPOrgItem
  }

  private async handleSentIPOrgItem(item: IPOrgItem) {
    if (item.org_address) {
      await updateIPOrg(this.prisma, item.id, {
        status: IP_ORG_STATUS.FINISHED,
      });
      return;
    }
    // TODO
  }
}
