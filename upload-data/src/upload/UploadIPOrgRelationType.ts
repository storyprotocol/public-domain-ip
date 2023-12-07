import { PrismaClient } from "@prisma/client";
import { RegisterRelationshipTypeResponse } from "@story-protocol/core-sdk";

import { Client } from "@story-protocol/core-sdk/dist/declarations/src/types/client";
import {
  getIPOrgRelationTypes,
  updateIPOrgRelationType,
} from "../query/iporgRelationType";
import { fileLogger } from "../utils/WLogger";
import { StoryProtocolKit } from "../components/StoryProtocolKit";
import { IPOrgRelationTypeItem } from "../interfaces/IRelationship";
import { BaseUpdateFields, UploadTotal } from "../interfaces/IBase";

export const IP_ORG_RELATION_TYPE_STATUS = {
  CREATED: 0,
  SENDING: 1,
  SENT: 2,
  FAILED: 3,
  FINISHED: 4,
};

export class UploadIPOrgRelationType {
  public prisma: PrismaClient;
  public client: Client;

  constructor(client: Client) {
    this.prisma = new PrismaClient();
    this.client = client;
  }

  public async upload(iporg?: string): Promise<UploadTotal> {
    const result: UploadTotal = {
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    };

    const ipOrgRelationTypes = await this.getIPOrgRelationTypes(iporg);
    if (ipOrgRelationTypes.length == 0) {
      fileLogger.info("There are no relationship types requiring upload.");
      return result;
    }

    try {
      for (const ipOrgRelationType of ipOrgRelationTypes) {
        fileLogger.info(
          `Uploading relation type item : ${JSON.stringify(ipOrgRelationType)}`
        );
        switch (ipOrgRelationType.status) {
          case IP_ORG_RELATION_TYPE_STATUS.CREATED:
            await this.uploadIPOrgRelationType(ipOrgRelationType);
            result.newItem++;
            break;
          case IP_ORG_RELATION_TYPE_STATUS.FAILED:
            await this.handleFailedIPOrgRelationTypeItem(ipOrgRelationType);
            result.failedItem++;
            break;
          case IP_ORG_RELATION_TYPE_STATUS.SENDING:
            await this.handleSendingIPOrgRelationTypeItem(ipOrgRelationType);
            result.sendingItem++;
            break;
          case IP_ORG_RELATION_TYPE_STATUS.SENT:
            await this.handleSentIPOrgRelationTypeItem(ipOrgRelationType);
            result.sentItem++;
            break;
          default:
            fileLogger.warn(`The status of the relationship type is not valid: ${ipOrgRelationType.status}`);
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

  private async getIPOrgRelationTypes(iporg?: string) {
    const ipOrgRelationTypes = await getIPOrgRelationTypes(
      this.prisma,
      IP_ORG_RELATION_TYPE_STATUS.FINISHED,
      iporg
    );
    fileLogger.info(
      `Found ${ipOrgRelationTypes.length} relationship type(s).`
    );
    return ipOrgRelationTypes;
  }

  private async uploadIPOrgRelationType(item: IPOrgRelationTypeItem) {
    if (!item.org_address) {
      fileLogger.error(`The org_address field is absent or not provided: ${JSON.stringify(item)}}`);
      throw new Error(`The org_address field is absent or not provided: ${JSON.stringify(item)}}`);
    }
    let txResult: RegisterRelationshipTypeResponse | undefined;
    try {
      await updateIPOrgRelationType(this.prisma, item.id, {
        status: IP_ORG_RELATION_TYPE_STATUS.SENDING,
      });

      txResult = await StoryProtocolKit.createIPOrgRelationType(this.client, {
        ipOrg: item.org_address,
        relType: item.relationship_type,
        allowedElements: {
          src: item.related_src,
          dst: item.related_dst,
        },
        allowedSrcs: JSON.parse(item.allowed_srcs || "[]"),
        allowedDsts: JSON.parse(item.allowed_dsts || "[]"),
      });

      await updateIPOrgRelationType(this.prisma, item.id, {
        tx_hash: txResult.txHash,
        status: IP_ORG_RELATION_TYPE_STATUS.FINISHED,
      });
    } catch (e) {
      fileLogger.error(
        `Uploading relationship type[${item.id}] was failed :${
          txResult?.txHash
        }:${JSON.stringify(item)} ${e}`
      );
      let uploadFields: BaseUpdateFields = {
        status: IP_ORG_RELATION_TYPE_STATUS.FAILED,
      };
      if (txResult) {
        uploadFields.tx_hash = txResult.txHash;
        uploadFields.status = IP_ORG_RELATION_TYPE_STATUS.SENT;
      }
      await updateIPOrgRelationType(this.prisma, item.id, uploadFields);
      throw e;
    }
  }

  private async handleFailedIPOrgRelationTypeItem(
    item: IPOrgRelationTypeItem
  ) {
    // TODO: handleFailedIPOrgRelationTypeItem
  }
  private async handleSendingIPOrgRelationTypeItem(
    item: IPOrgRelationTypeItem
  ) {
    // TODO: handleSendingIPOrgRelationTypeItem
  }

  private async handleSentIPOrgRelationTypeItem(item: IPOrgRelationTypeItem) {
    if (item.tx_hash) {
      await updateIPOrgRelationType(this.prisma, item.id, {
        status: IP_ORG_RELATION_TYPE_STATUS.FINISHED,
      });
      return;
    }
    // TODO
  }
}
