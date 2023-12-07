import { PrismaClient } from "@prisma/client";
import { RegisterRelationshipResponse } from "@story-protocol/core-sdk";
import { Client } from "@story-protocol/core-sdk/dist/declarations/src/types/client";

import { getRelationships, updateRelationship } from "../query/relationship";
import { fileLogger } from "../utils/WLogger";
import { StoryProtocolKit } from "../components/StoryProtocolKit";
import {
  RelationshipItem,
  RelationshipUpdateFields,
} from "../interfaces/IRelationship";
import { UploadTotal } from "../interfaces/IBase";

export const RELATIONSHIP_STATUS = {
  CREATED: 0,
  SENDING: 1,
  SENT: 2,
  FAILED: 3,
  FINISHED: 4,
};

export class UploadRelationship {
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

    const relationships = await this.getRelationships(iporg);
    if (relationships.length == 0) {
      fileLogger.info("There are no relationship requiring upload.");
      return result;
    }

    try {
      for (const relationship of relationships) {
        fileLogger.info(
          `Handling relationship item: ${JSON.stringify(relationship)}`
        );
        switch (relationship.status) {
          case RELATIONSHIP_STATUS.CREATED:
            await this.uploadRelationship(relationship);
            result.newItem++;
            break;
          case RELATIONSHIP_STATUS.FAILED:
            await this.handleFailedRelationship(relationship);
            result.failedItem++;
            break;
          case RELATIONSHIP_STATUS.SENDING:
            await this.handleSendingRelationship(relationship);
            result.sendingItem++;
            break;
          case RELATIONSHIP_STATUS.SENT:
            await this.handleSentRelationship(relationship);
            result.sentItem++;
            break;
          default:
            fileLogger.warn(
              `The status of the relationship is not valid: ${relationship.status}`
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

  private async getRelationships(iporg?: string) {
    const relationships = await getRelationships(
      this.prisma,
      RELATIONSHIP_STATUS.FINISHED,
      iporg
    );
    fileLogger.info(`Found ${relationships.length} relationship(s).`);
    return relationships;
  }

  private async uploadRelationship(item: RelationshipItem) {
    const registryAddress = process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT;
    if (!registryAddress) {
      throw new Error(
        `The environment variable NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT has not been configured: ${JSON.stringify(
          item
        )}}`
      );
    }
    if (!item.org_address) {
      throw new Error(
        `The org_address field is absent or not provided: ${JSON.stringify(
          item
        )}}`
      );
    }

    if (!item.src_asset_seq_id || !item.dst_asset_seq_id) {
      throw new Error(
        `The src_asset_seq_id or dst_asset_seq_id field is absent or not provided: ${JSON.stringify(
          item
        )}}`
      );
    }
    let txResult: RegisterRelationshipResponse | undefined;

    try {
      await updateRelationship(this.prisma, item.id, {
        status: RELATIONSHIP_STATUS.SENDING,
      });

      txResult = await StoryProtocolKit.createRelationship(this.client, {
        orgAddress: item.org_address,
        relType: item.relationship_type,
        srcAddress: registryAddress,
        srcId: item.src_asset_seq_id,
        dstAddress: registryAddress,
        dstId: item.dst_asset_seq_id,
      });

      await updateRelationship(this.prisma, item.id, {
        tx_hash: txResult.txHash,
        relationship_seq_id: txResult.relationshipId,
        status: RELATIONSHIP_STATUS.FINISHED,
      });
    } catch (e) {
      fileLogger.error(
        `Uploading relationship[${item.id}] was failed : ${
          txResult?.txHash
        }:${JSON.stringify(item)} ${e}`
      );
      let uploadFields: RelationshipUpdateFields = {
        status: RELATIONSHIP_STATUS.FAILED,
      };
      if (txResult && txResult.relationshipId) {
        uploadFields.tx_hash = txResult.txHash;
        uploadFields.relationship_seq_id = txResult.relationshipId;
        uploadFields.status = RELATIONSHIP_STATUS.SENT;
      }
      await updateRelationship(this.prisma, item.id, uploadFields);
      throw e;
    }
  }

  private async handleFailedRelationship(item: RelationshipItem) {
    // TODO: handle failed relationship
  }

  private async handleSendingRelationship(item: RelationshipItem) {
    // TODO: handle sending relationship
  }

  private async handleSentRelationship(item: RelationshipItem) {
    if (item.relationship_seq_id) {
      await updateRelationship(this.prisma, item.id, {
        status: RELATIONSHIP_STATUS.FINISHED,
      });
      return;
    }
    // TODO
  }
}
