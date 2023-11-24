import { BaseUpdateFields } from "./IBase";

export interface RegisterIPOrgRelationTypeParams {
  relType: string;
  ipOrg: string;
  allowedElements: {
    src: number;
    dst: number;
  };
  allowedSrcs: number[];
  allowedDsts: number[];
}

export const DefaultRegisterIPOrgRelationTypeParams: RegisterIPOrgRelationTypeParams =
  {
    relType: "",
    ipOrg: "",
    allowedElements: {
      src: 0,
      dst: 0,
    },
    allowedSrcs: [],
    allowedDsts: [],
  };

export interface RelationshipParams {
  relType: string;
  srcAddress: string;
  srcId: number;
  srcType: number;
  dstAddress: string;
  dstId: number;
  dstType: number;
}

export interface IPOrgRelationTypeItem {
  id: string;
  ip_org_id: string;
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
  ip_org_id: string;
  org_address?: string;
  relationship_type: string;
  src_address: string;
  src_id: string;
  src_type: number;
  dst_address: string;
  dst_id: string;
  dst_type: number;
  relationship_seq_id?: number | null;
  src_asset_id?: number | null;
  dst_asset_id?: number | null;
  tx_hash?: string | null;
  status: number;
}

export interface RelationshipUpdateFields extends BaseUpdateFields {
  relationship_seq_id?: number;
  src_asset_id?: number;
  dst_asset_id?: number;
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
