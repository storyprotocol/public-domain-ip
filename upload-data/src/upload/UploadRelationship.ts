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

  public async upload(): Promise<UploadTotal> {
    const result: UploadTotal = {
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    };

    const relationships = await this.getRelationships();
    if (relationships.length == 0) {
      fileLogger.info("No relationship need to upload.");
      return result;
    }

    try {
      for (const relationship of relationships) {
        switch (relationship.status) {
          case RELATIONSHIP_STATUS.CREATED:
            this.uploadRelationship(relationship);
            break;
          case RELATIONSHIP_STATUS.FAILED:
            this.uploadRelationship(relationship);
            break;
          case RELATIONSHIP_STATUS.SENDING:
            this.handleSendingRelationship(relationship);
            break;
          case RELATIONSHIP_STATUS.SENT:
            this.handleSentRelationship(relationship);
            break;
          default:
            fileLogger.warn(
              `Invalid relationship status ${relationship.status}`
            );
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

  private async getRelationships() {
    const relationships = await getRelationships(
      this.prisma,
      RELATIONSHIP_STATUS.FINISHED
    );
    fileLogger.info(`Fund ${relationships.length} relationship(s).`);
    return relationships;
  }

  private async uploadRelationship(item: RelationshipItem) {
    if (!item.org_address) {
      throw new Error(`org_address is null: ${JSON.stringify(item)}}`);
    }
    if (!item.src_asset_id || !item.dst_asset_id) {
      throw new Error(
        `src_asset_id or dst_asset_id is null: ${JSON.stringify(item)}}`
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
        srcAddress: item.src_address,
        srcId: item.src_asset_id,
        srcType: item.src_type,
        dstAddress: item.dst_address,
        dstId: item.dst_asset_id,
        dstType: item.dst_type,
      });

      await updateRelationship(this.prisma, item.id, {
        tx_hash: txResult.txHash,
        relationship_seq_id: txResult.relationshipId,
        status: RELATIONSHIP_STATUS.FINISHED,
      });
    } catch (e) {
      fileLogger.error(
        `Failed to upload relationship ${item.id}:${
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

  private async handleSendingRelationship(item: RelationshipItem) {
    // TODO: handle sending relationship
  }

  private async handleSentRelationship(item: RelationshipItem) {
    if (item.relationship_seq_id) {
      await updateRelationship(this.prisma, item.id, {
        status: RELATIONSHIP_STATUS.FINISHED,
      });
    }
  }
}
