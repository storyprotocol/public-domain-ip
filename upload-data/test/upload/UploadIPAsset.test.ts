import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { UploadIPAsset } from "../../src/upload/UploadIPAsset";

jest.mock("@prisma/client", () => {
  const originalModule: any = jest.requireActual("@prisma/client");
  return {
    __esModule: true,
    ...originalModule,
    PrismaClient: jest.fn(),
  };
});

jest.mock("@story-protocol/core-sdk", () => {
  const originalModule: any = jest.requireActual("@story-protocol/core-sdk");
  return {
    __esModule: true,
    ...originalModule,
    StoryClient: {
      newClient: jest.fn(),
    },
  };
});

jest.mock("../../src/components/StoryProtocolKit");

jest.mock("../../src/query/ipasset", () => ({
  getIpAssets: jest.fn(),
  updateIPAsset: jest.fn(),
}));

jest.mock("../../src/components/Uploader");

import { PrismaClient } from "@prisma/client";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { getIpAssets, updateIPAsset } from "../../src/query/ipasset";
import { StoryProtocolKit } from "../../src/components/StoryProtocolKit";
import { Uploader } from "../../src/components/Uploader";

describe("UploadIPAsset", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultIPAssetItem = {
    id: "id",
    ip_organization_id: "001",
    org_address: "org_address",
    name: "name",
    owner: "owner",
    type: 1,
    metadata_raw: "{}",
    description: "description",
    image_url: "image_url",
    ip_hash: "ip_hash",
    metadata_url: "metadata_url",
    asset_seq_id: "002",
    tx_hash: "tx_hash",
    status: 0,
  };

  it("UploadIPAsset constructor", () => {
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    expect(uploadIPAsset.prisma).toBeInstanceOf(PrismaClient);
    expect(uploadIPAsset.client).toEqual(client);
  });

  it("closeConnection function", async () => {
    (PrismaClient as any).mockImplementation(() => {
      return {
        $disconnect: jest.fn(),
      };
    });
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    await uploadIPAsset.closeConnection();
    expect(uploadIPAsset.prisma.$disconnect).toBeCalled();
  });

  it("upload with empty item", async () => {
    (getIpAssets as any).mockResolvedValue([]);
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with incorrect item", async () => {
    (getIpAssets as any).mockResolvedValue([
      { ...defaultIPAssetItem, status: 4 },
    ]);
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with failed item", async () => {
    (getIpAssets as any).mockResolvedValue([
      { ...defaultIPAssetItem, status: 3 },
    ]);
    (updateIPAsset as any).mockResolvedValue({
      ...defaultIPAssetItem,
      status: 4,
    });

    (StoryProtocolKit.createIPAsset as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipAssetId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 1,
    });
  });

  it("upload with sending item", async () => {
    (getIpAssets as any).mockResolvedValue([
      { ...defaultIPAssetItem, status: 1 },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 1,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with sent item with asset_seq_id", async () => {
    (getIpAssets as any).mockResolvedValue([
      { ...defaultIPAssetItem, status: 2 },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(1);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 1,
      failedItem: 0,
    });
  });

  it("upload with sent item without asset_seq_id", async () => {
    (getIpAssets as any).mockResolvedValue([
      { ...defaultIPAssetItem, asset_seq_id: undefined, status: 2 },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 1,
      failedItem: 0,
    });
  });

  it("upload with created item with metadata_url", async () => {
    (getIpAssets as any).mockResolvedValue([{ ...defaultIPAssetItem }]);

    (StoryProtocolKit.createIPAsset as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipAssetId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(2);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with created story item without metadata_url", async () => {
    (getIpAssets as any).mockResolvedValue([
      { ...defaultIPAssetItem, metadata_url: undefined, type: 1 },
    ]);

    (StoryProtocolKit.createIPAsset as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipAssetId: "1",
    });

    (Uploader.prototype.uploadText as any).mockResolvedValue(
      "https://story-staging.onflow.org/ipfs/b"
    );

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(3);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(1);
    expect(Uploader.prototype.uploadText).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with created chapter item without metadata_url", async () => {
    (getIpAssets as any).mockResolvedValue([
      { ...defaultIPAssetItem, metadata_url: undefined, type: 2 },
    ]);

    (StoryProtocolKit.createIPAsset as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipAssetId: "1",
    });

    (Uploader.prototype.uploadText as any).mockResolvedValue(
      "https://story-staging.onflow.org/ipfs/b"
    );

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(3);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(1);
    expect(Uploader.prototype.uploadText).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with created character item without metadata_url", async () => {
    (getIpAssets as any).mockResolvedValue([
      { ...defaultIPAssetItem, metadata_url: undefined, type: 3 },
    ]);

    (StoryProtocolKit.createIPAsset as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipAssetId: "1",
    });

    (Uploader.prototype.uploadText as any).mockResolvedValue(
      "https://story-staging.onflow.org/ipfs/A"
    );

    (Uploader.prototype.uploadImage as any).mockResolvedValue(
      "https://story-staging.onflow.org/ipfs/B"
    );

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    const result = await uploadIPAsset.upload();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(3);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(1);
    expect(Uploader.prototype.uploadText).toBeCalledTimes(2);
    expect(Uploader.prototype.uploadImage).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with created character item throw error for image_url", async () => {
    (getIpAssets as any).mockResolvedValue([
      {
        ...defaultIPAssetItem,
        metadata_url: undefined,
        type: 3,
        image_url: undefined,
      },
    ]);

    (StoryProtocolKit.createIPAsset as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipAssetId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    await expect(uploadIPAsset.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(0);
    expect(Uploader.prototype.uploadText).toBeCalledTimes(0);
    expect(Uploader.prototype.uploadImage).toBeCalledTimes(0);
  });

  it("upload with created character item throw error for description", async () => {
    (getIpAssets as any).mockResolvedValue([
      {
        ...defaultIPAssetItem,
        metadata_url: undefined,
        type: 3,
        description: undefined,
      },
    ]);

    (StoryProtocolKit.createIPAsset as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipAssetId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    await expect(uploadIPAsset.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(0);
    expect(Uploader.prototype.uploadText).toBeCalledTimes(0);
    expect(Uploader.prototype.uploadImage).toBeCalledTimes(0);
  });

  it("upload with created story item throw error for meta_data", async () => {
    (getIpAssets as any).mockResolvedValue([
      {
        ...defaultIPAssetItem,
        metadata_url: undefined,
        type: 1,
        metadata_raw: undefined,
      },
    ]);

    (StoryProtocolKit.createIPAsset as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipAssetId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    await expect(uploadIPAsset.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(0);
    expect(Uploader.prototype.uploadText).toBeCalledTimes(0);
    expect(Uploader.prototype.uploadImage).toBeCalledTimes(0);
  });

  it("upload without org_address", async () => {
    (getIpAssets as any).mockResolvedValue([
      {
        ...defaultIPAssetItem,
        org_address: undefined,
      },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPAsset = new UploadIPAsset(client, "");
    await expect(uploadIPAsset.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getIpAssets).toBeCalledTimes(1);
    expect(updateIPAsset).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPAsset).toBeCalledTimes(0);
    expect(Uploader.prototype.uploadText).toBeCalledTimes(0);
    expect(Uploader.prototype.uploadImage).toBeCalledTimes(0);
  });
});
