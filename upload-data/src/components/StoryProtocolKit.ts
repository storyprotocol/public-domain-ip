import { Client } from "@story-protocol/core-sdk/dist/declarations/src/types/client";
import {
  CreateIPOrgRequest,
  CreateIPOrgResponse,
} from "@story-protocol/core-sdk";
import {
  RegisterRelationshipTypeRequest,
  RegisterRelationshipTypeResponse,
} from "@story-protocol/core-sdk";
import {
  CreateIpAssetResponse,
  CreateIpAssetRequest,
} from "@story-protocol/core-sdk";
import {
  RegisterRelationshipRequest,
  RegisterRelationshipResponse,
} from "@story-protocol/core-sdk";

import { fileLogger } from "../utils/WLogger";

export class StoryProtocolKit {
  private constructor() {}

  public static createIPOrg(
    client: Client,
    orgItem: any
  ): Promise<CreateIPOrgResponse> {
    const params: CreateIPOrgRequest = {
      name: orgItem.name,
      symbol: orgItem.symbol,
      owner: orgItem.owner,
      ipAssetTypes: orgItem.ip_asset_types,
      txOptions: {
        waitForTransaction: true,
      },
    };
    return client.ipOrg.create(params);
  }

  public static createIPOrgRelationType(
    client: Client,
    item: any
  ): Promise<RegisterRelationshipTypeResponse> {
    if (!item.org_address) {
      fileLogger.error(`org_address is null: ${JSON.stringify(item)}}`);
      throw new Error("org_address is null");
    }
    const params: RegisterRelationshipTypeRequest = {
      ipOrgId: item.org_address,
      relType: item.relationship_type,
      relatedElements: {
        src: item.related_src,
        dst: item.related_dst,
      },
      allowedSrcs: item.allowed_srcs,
      allowedDsts: item.allowed_dsts,
      preHooksConfig: [],
      postHooksConfig: [],
      txOptions: {
        waitForTransaction: true,
      },
    };
    return client.relationship.registerRelationshipType(params);
  }

  public static createIPAsset(
    client: Client,
    item: any
  ): Promise<CreateIpAssetResponse> {
    // const preHooksData: string[] = [];
    // const postHooksData: string[] = [];
    const params: CreateIpAssetRequest = {
      name: item.name,
      type: item.type,
      ipOrgId: item.org_address,
      owner: item.owner,
      mediaUrl: item.mediaUrl,
      contentHash: item.contentHash,
      txOptions: {
        waitForTransaction: true,
      },
    };
    return client.ipAsset.create(params);
  }

  public static createRelationship(
    client: Client,
    item: any
  ): Promise<RegisterRelationshipResponse> {
    // const preHooksData: string[] = [];
    // const postHooksData: string[] = [];
    const params: RegisterRelationshipRequest = {
      ipOrgId: item.org_address,
      relType: item.relationship_type,
      srcContract: item.srcContract,
      srcTokenId: item.srcTokenId,
      srcType: item.srcType,
      dstContract: item.dstContract,
      dstTokenId: item.dstTokenId,
      dstType: item.dstType,
      preHookData: [],
      postHookData: [],
      txOptions: {
        waitForTransaction: true,
      },
    };
    return client.relationship.register(params);
  }
}
