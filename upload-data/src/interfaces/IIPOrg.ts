import { BaseUpdateFields } from "./IBase";

export interface RegisterIPOrgParams {
  name: string;
  symbol: string;
  owner?: string;
  assetTypes: string[];
}

export const DefaultRegisterIPOrgParams: RegisterIPOrgParams = {
  name: "",
  symbol: "",
  owner: "",
  // 1: book, 2: chapter, 3: character, 4: art, 5: location, 6: item
  assetTypes: ["1", "2", "3", "4", "5", "6"],
};

export interface IPOrgItem {
  id: string;
  org_address?: string | null;
  name: string;
  symbol: string;
  owner?: string;
  ip_asset_types: string[];
  tx_hash?: string | null;
  status: number;
}

export interface IPOrgUpdateFields extends BaseUpdateFields {
  owner?: string;
  org_address?: string;
}

export interface IPOrgRegisteredEvent {
  owner: string;
  ipAssetOrg: string;
  name: string;
  symbol: string;
  tokenURI: string;
}
