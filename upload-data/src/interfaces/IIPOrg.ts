import { BaseUpdateFields } from "./IBase";

export interface RegisterIPOrgParams {
  registry: string;
  name: string;
  symbol: string;
  description: string;
  metadata_url: string;
}

export const DefaultRegisterIPOrgParams: RegisterIPOrgParams = {
  registry: "",
  name: "",
  symbol: "",
  description: "",
  metadata_url: "",
};

export interface IPOrgItem {
  id: string;
  org_address?: string | null;
  registry_addr: string;
  name: string;
  symbol: string;
  description?: string | null;
  owner?: string | null;
  metadata_url?: string | null;
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
