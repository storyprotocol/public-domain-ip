import { BaseUpdateFields } from "./IBase";

export interface RegisterIPAssetParams {
  orgAddress: string;
  owner: string;
  name: string;
  ipAssetType: number;
  hash: string;
  mediaUrl: string;
}

export interface IPAssetRegisteredEvent {
  ipAssetId: number;
  ipOrg: string;
  ipOrgAssetId: number;
  owner: string;
  name: string;
  ipAssetType: number;
  hash: string;
  mediaUrl: string;
}

export interface IPAssetItem {
  id: string;
  ip_org_id: string;
  org_address?: string;
  type: number;
  name: string;
  ip_hash: string;
  url?: string | null;
  owner: string;
  asset_seq_id?: number | null;
  tx_hash?: string | null;
  status: number;
}

export interface IPAssetUpdateFields extends BaseUpdateFields {
  asset_seq_id?: string;
}
