import { BaseUpdateFields } from "./IBase";

export interface RegisterIPOrgRelationTypeParams {
  relType: string;
  ipOrg: string;
  allowedElements: {
    src: number;
    dst: number;
  };
  allowedSrcs: string[];
  allowedDsts: string[];
}

export const DefaultRegisterIPOrgRelationTypeParams: RegisterIPOrgRelationTypeParams =
  {
    relType: "",
    ipOrg: "",
    allowedElements: {
      src: 1,
      dst: 1,
    },
    allowedSrcs: ["1"],
    allowedDsts: ["1"],
  };

export interface RelationshipParams {
  orgAddress: string;
  relType: string;
  srcAddress: string;
  srcId: string;
  dstAddress: string;
  dstId: string;
}

export interface IPOrgRelationTypeItem {
  id: string;
  ip_organization_id: string;
  org_address?: string;
  relationship_type: string;
  related_src: number;
  related_dst: number;
  allowed_srcs: string | null;
  allowed_dsts: string | null;
  tx_hash?: string | null;
  status: number;
}

export interface RelationshipItem {
  id: string;
  ip_organization_id: string;
  org_address?: string;
  relationship_type: string;
  src_asset_seq_id?: string;
  src_asset_id: string;
  dst_asset_seq_id?: string;
  dst_asset_id: string;
  relationship_seq_id?: string | null;
  tx_hash?: string | null;
  status: number;
}

export interface RelationshipUpdateFields extends BaseUpdateFields {
  relationship_seq_id?: string;
}

export interface IPOrgRelationTypeRegisteredEvent {
  relType: string;
  ipOrg: string;
  src: string;
  srcRelatable: number;
  srcSubtypesMask: number;
  dst: string;
  dstRelatable: number;
  dstSubtypesMask: number;
}

export interface RelationshipCreatedEvent {
  relationshipId: number;
  relType: string;
  srcAddress: string;
  srcId: number;
  dstAddress: string;
  dstId: number;
}
