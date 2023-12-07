import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { UploadRelationship } from "../../src/upload/UploadRelationship";

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

jest.mock("../../src/query/relationship", () => ({
  getRelationships: jest.fn(),
  updateRelationship: jest.fn(),
}));

import { PrismaClient } from "@prisma/client";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import {
  getRelationships,
  updateRelationship,
} from "../../src/query/relationship";
import { StoryProtocolKit } from "../../src/components/StoryProtocolKit";

describe("UploadRelationship", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultRelationshipItem = {
    id: "id",
    ip_organization_id: "ip_organization_id",
    org_address: "org_address",
    relationship_type: "relationship_type",
    src_asset_seq_id: "src_asset_seq_id",
    src_asset_id: "src_asset_id",
    dst_asset_seq_id: "dst_asset_seq_id",
    dst_asset_id: "dst_asset_id",
    relationship_seq_id: "relationship_seq_id",
    tx_hash: "tx_hash",
    status: 0,
  };

  it("UploadRelationship constructor", () => {
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    expect(uploadRelationship.prisma).toBeInstanceOf(PrismaClient);
    expect(uploadRelationship.client).toEqual(client);
  });

  it("closeConnection function", async () => {
    (PrismaClient as any).mockImplementation(() => {
      return {
        $disconnect: jest.fn(),
      };
    });
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    await uploadRelationship.closeConnection();
    expect(uploadRelationship.prisma.$disconnect).toBeCalled();
  });

  it("upload with empty item", async () => {
    (getRelationships as any).mockResolvedValue([]);
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    const result = await uploadRelationship.upload();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with incorrect item", async () => {
    (getRelationships as any).mockResolvedValue([
      { ...defaultRelationshipItem, status: 4 },
    ]);
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    const result = await uploadRelationship.upload();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with created item", async () => {
    (getRelationships as any).mockResolvedValue([defaultRelationshipItem]);
    (updateRelationship as any).mockResolvedValue({
      ...defaultRelationshipItem,
      status: 4,
    });

    (StoryProtocolKit.createRelationship as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      relationshipId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    const result = await uploadRelationship.upload();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(2);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with passed ip org", async () => {
    (getRelationships as any).mockResolvedValue([defaultRelationshipItem]);
    (updateRelationship as any).mockResolvedValue({
      ...defaultRelationshipItem,
      status: 4,
    });

    (StoryProtocolKit.createRelationship as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      relationshipId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    const result = await uploadRelationship.upload("123");
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(2);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with failed item", async () => {
    (getRelationships as any).mockResolvedValue([
      {
        ...defaultRelationshipItem,
        status: 3,
      },
    ]);
    (updateRelationship as any).mockResolvedValue({
      ...defaultRelationshipItem,
      status: 4,
    });

    (StoryProtocolKit.createRelationship as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    const result = await uploadRelationship.upload();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(0);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 1,
    });
  });

  it("upload with sending item", async () => {
    (getRelationships as any).mockResolvedValue([
      { ...defaultRelationshipItem, status: 1 },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    const result = await uploadRelationship.upload();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(0);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 1,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with sent item with relationship_seq_id", async () => {
    (getRelationships as any).mockResolvedValue([
      { ...defaultRelationshipItem, status: 2 },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    const result = await uploadRelationship.upload();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(1);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 1,
      failedItem: 0,
    });
  });

  it("upload with sent item with relationship_seq_id", async () => {
    (getRelationships as any).mockResolvedValue([
      { ...defaultRelationshipItem, status: 2, relationship_seq_id: undefined },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    const result = await uploadRelationship.upload();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(0);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 1,
      failedItem: 0,
    });
  });

  it("upload without org_address throw error", async () => {
    (getRelationships as any).mockResolvedValue([
      { ...defaultRelationshipItem, org_address: undefined },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    await expect(uploadRelationship.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(0);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(0);
  });

  it("upload without src_asset_seq_id throw error", async () => {
    (getRelationships as any).mockResolvedValue([
      { ...defaultRelationshipItem, src_asset_seq_id: undefined },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    await expect(uploadRelationship.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(0);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(0);
  });

  it("upload without dst_asset_seq_id throw error", async () => {
    (getRelationships as any).mockResolvedValue([
      { ...defaultRelationshipItem, dst_asset_seq_id: undefined },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    await expect(uploadRelationship.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(0);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(0);
  });

  it("upload with created item but throw error", async () => {
    (getRelationships as any).mockResolvedValue([defaultRelationshipItem]);
    (updateRelationship as any).mockResolvedValue({
      ...defaultRelationshipItem,
      status: 4,
    });

    (StoryProtocolKit.createRelationship as any).mockImplementation(() => {
      throw new Error("createRelationship error");
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);

    await expect(uploadRelationship.upload()).rejects.toThrow(
      "createRelationship error"
    );
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(2);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(1);
  });

  it("upload without registry address throw error", async () => {
    process.env.NEXT_PUBLIC_IP_ASSET_REGISTRY_CONTRACT = "";

    (getRelationships as any).mockResolvedValue([
      { ...defaultRelationshipItem },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationship = new UploadRelationship(client);
    await expect(uploadRelationship.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getRelationships).toBeCalledTimes(1);
    expect(updateRelationship).toBeCalledTimes(0);
    expect(StoryProtocolKit.createRelationship).toBeCalledTimes(0);
  });
});
