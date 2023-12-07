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

import { RegisterIPOrgParams } from "../interfaces/IIPOrg";
import { RegisterIPOrgRelationTypeParams } from "../interfaces/IRelationship";
import { RegisterIPAssetParams } from "../interfaces/IIPAsset";
import { RelationshipParams } from "../interfaces/IRelationship";
import { fileLogger } from "../utils/WLogger";

export class StoryProtocolKit {
  private constructor() {}

  public static createIPOrg(
    client: Client,
    orgItem: RegisterIPOrgParams
  ): Promise<CreateIPOrgResponse> {
    const params: CreateIPOrgRequest = {
      name: orgItem.name,
      symbol: orgItem.symbol,
      owner: orgItem.owner,
      ipAssetTypes: orgItem.assetTypes,
      txOptions: {
        waitForTransaction: true,
      },
    };
    return client.ipOrg.create(params);
  }

  public static createIPOrgRelationType(
    client: Client,
    item: RegisterIPOrgRelationTypeParams
  ): Promise<RegisterRelationshipTypeResponse> {
    if (!item.ipOrg) {
      fileLogger.error(`The ipOrg field is absent or not provided: ${JSON.stringify(item)}}`);
      throw new Error("The ipOrg field is absent or not provided.");
    }
    const params: RegisterRelationshipTypeRequest = {
      ipOrgId: item.ipOrg,
      relType: item.relType,
      relatedElements: {
        src: item.allowedElements.src,
        dst: item.allowedElements.dst,
      },
      allowedSrcIpAssetTypes: item.allowedSrcs,
      allowedDstIpAssetTypes: item.allowedDsts,
      preHooksConfig: [],
      postHooksConfig: [],
      txOptions: {
        waitForTransaction: true,
      },
    };
    return client.relationshipType.register(params);
  }

  public static createIPAsset(
    client: Client,
    item: RegisterIPAssetParams
  ): Promise<CreateIpAssetResponse> {
    const params: CreateIpAssetRequest = {
      name: item.name,
      typeIndex: item.ipAssetType,
      ipOrgId: item.orgAddress,
      owner: item.owner,
      mediaUrl: item.mediaUrl,
      contentHash: item.hash,
      txOptions: {
        waitForTransaction: true,
      },
    };
    return client.ipAsset.create(params);
  }

  public static createRelationship(
    client: Client,
    item: RelationshipParams
  ): Promise<RegisterRelationshipResponse> {
    const params: RegisterRelationshipRequest = {
      ipOrgId: item.orgAddress,
      relType: item.relType,
      srcContract: item.srcAddress,
      srcTokenId: item.srcId,
      dstContract: item.dstAddress,
      dstTokenId: item.dstId,
      preHookData: [],
      postHookData: [],
      txOptions: {
        waitForTransaction: true,
      },
    };
    return client.relationship.register(params);
  }
}
