import { BaseUpdateFields } from "./IBase";

export interface RegisterIPAssetParams {
  orgAddress: string;
  owner?: string;
  name: string;
  ipAssetType: number;
  hash?: string;
  mediaUrl?: string;
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
  ip_organization_id: string;
  org_address?: string;
  type: number;
  name: string;
  owner?: string;
  metadata_raw?: string;
  description?: string;
  image_url?: string;
  ip_hash?: string;
  metadata_url?: string | null;
  asset_seq_id?: string | null;
  tx_hash?: string | null;
  status: number;
}

export interface IPAssetUpdateFields extends BaseUpdateFields {
  owner?: string;
  metadata_url?: string;
  asset_seq_id?: string;
  metadata_raw?: string;
}
