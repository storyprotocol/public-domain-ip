import { BaseUpdateFields } from "./IBase";

export interface RegisterIPOrgParams {
  name: string;
  symbol: string;
  owner: string;
  assetTypes: string[];
}

export const DefaultRegisterIPOrgParams: RegisterIPOrgParams = {
  name: "",
  symbol: "",
  owner: "",
  // 1: story, 2: character, 3: art, 4: chapter, 5: location, 6: item
  assetTypes: ["1", "2", "3", "4", "5", "6"],
};

export interface IPOrgItem {
  id: string;
  org_address?: string | null;
  name: string;
  symbol: string;
  owner: string;
  tx_hash?: string | null;
  status: number;
}

export interface IPOrgUpdateFields extends BaseUpdateFields {
  org_address?: string;
}

export interface IPOrgRegisteredEvent {
  owner: string;
  ipAssetOrg: string;
  name: string;
  symbol: string;
  tokenURI: string;
}
