export type FieldReturns = Record<string, string>;

export type UploadTotal = {
  newItem: number;
  sendingItem: number;
  sentItem: number;
  failedItem: number;
};

export interface BaseUpdateFields {
  tx_hash?: string;
  status?: number;
}
