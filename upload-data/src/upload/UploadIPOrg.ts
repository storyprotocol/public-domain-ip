import { PrismaClient } from "@prisma/client";
import { Client } from "@story-protocol/core-sdk/dist/declarations/src/types/client";
import { CreateIPOrgResponse } from "@story-protocol/core-sdk";

import { getIpOrgs, updateIPOrg } from "../query/iporg";
import { fileLogger } from "../utils/WLogger";
import { IPOrgItem } from "../interfaces/IIPOrg";
import { StoryProtocolKit } from "../components/StoryProtocolKit";
import { UploadTotal } from "../interfaces/IBase";
import {
  DefaultRegisterIPOrgParams,
  IPOrgUpdateFields,
} from "../interfaces/IIPOrg";

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

  constructor(client: Client) {
    this.prisma = new PrismaClient();
    this.client = client;
  }

  public async upload(): Promise<UploadTotal> {
    const ipOrgs = await this.getIPOrgs();
    const result: UploadTotal = {
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    };
    if (ipOrgs.length == 0) {
      fileLogger.info("No ipOrgs to upload.");
      return result;
    }
    try {
      for (const ipOrg of ipOrgs) {
        switch (ipOrg.status) {
          case IP_ORG_STATUS.CREATED:
            this.uploadIPOrgItem(ipOrg);
            result.newItem++;
            break;
          case IP_ORG_STATUS.FAILED:
            this.uploadIPOrgItem(ipOrg);
            result.failedItem++;
            break;
          case IP_ORG_STATUS.SENDING:
            this.handleSendingIPOrgItem(ipOrg);
            result.sendingItem++;
            break;
          case IP_ORG_STATUS.SENT:
            this.handleSentIPOrgItem(ipOrg);
            result.sentItem++;
            break;
          default:
            fileLogger.warn(`Invalid ipOrg status ${ipOrg.status}`);
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

  private async getIPOrgs() {
    const ipOrgs = await getIpOrgs(this.prisma, IP_ORG_STATUS.FINISHED);
    fileLogger.info(`Fund ${ipOrgs.length} ipOrgs.`);
    return ipOrgs;
  }

  private async uploadIPOrgItem(item: IPOrgItem) {
    let txResult: CreateIPOrgResponse | undefined;
    try {
      await updateIPOrg(this.prisma, item.id, {
        status: IP_ORG_STATUS.SENDING,
      });

      txResult = await StoryProtocolKit.createIPOrg(this.client, {
        ...DefaultRegisterIPOrgParams,
        name: item.name,
        symbol: item.symbol,
        owner: item.owner,
      });

      await updateIPOrg(this.prisma, item.id, {
        org_address: txResult.ipOrgId,
        tx_hash: txResult.txHash,
        status: IP_ORG_STATUS.FINISHED,
      });
    } catch (e) {
      fileLogger.error(
        `Failed to upload ipOrg ${item.id}:${txResult?.txHash}:${JSON.stringify(
          item
        )} ${e}`
      );
      let uploadFields: IPOrgUpdateFields = { status: IP_ORG_STATUS.FAILED };
      if (txResult && txResult.ipOrgId) {
        uploadFields.org_address = txResult.ipOrgId;
        uploadFields.tx_hash = txResult.txHash;
        uploadFields.status = IP_ORG_STATUS.SENT;
      }
      await updateIPOrg(this.prisma, item.id, uploadFields);
      throw e;
    }
  }

  private async handleSendingIPOrgItem(item: IPOrgItem) {
    // TODO: handleSendingIPOrgItem
  }

  private async handleSentIPOrgItem(item: IPOrgItem) {
    if (item.org_address) {
      await updateIPOrg(this.prisma, item.id, {
        status: IP_ORG_STATUS.FINISHED,
      });
    }
  }
}
