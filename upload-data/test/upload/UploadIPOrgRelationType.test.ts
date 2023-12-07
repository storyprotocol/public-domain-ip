import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { UploadIPOrgRelationType } from "../../src/upload/UploadIPOrgRelationType";

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

jest.mock("../../src/query/iporgRelationType", () => ({
  getIPOrgRelationTypes: jest.fn(),
  updateIPOrgRelationType: jest.fn(),
}));

import { PrismaClient } from "@prisma/client";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import {
  getIPOrgRelationTypes,
  updateIPOrgRelationType,
} from "../../src/query/iporgRelationType";
import { StoryProtocolKit } from "../../src/components/StoryProtocolKit";

describe("UploadIPOrgRelationType", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultIPOrgRelationTypeItem = {
    id: "id",
    ip_organization_id: "ip_organization_id",
    org_address: "org_address",
    relationship_type: "relationship_type",
    related_src: "related_src",
    related_dst: "related_dst",
    allowed_srcs: '["1"]',
    allowed_dsts: '["1"]',
    tx_hash: "tx_hash",
    status: 0,
  };

  it("UploadIPOrgRelationType constructor", () => {
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrgRelationType = new UploadIPOrgRelationType(client);
    expect(uploadIPOrgRelationType.prisma).toBeInstanceOf(PrismaClient);
    expect(uploadIPOrgRelationType.client).toEqual(client);
  });

  it("closeConnection function", async () => {
    (PrismaClient as any).mockImplementation(() => {
      return {
        $disconnect: jest.fn(),
      };
    });
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrgRelationType = new UploadIPOrgRelationType(client);
    await uploadIPOrgRelationType.closeConnection();
    expect(uploadIPOrgRelationType.prisma.$disconnect).toBeCalled();
  });

  it("upload with empty item", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([]);
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrgRelationType = new UploadIPOrgRelationType(client);
    const result = await uploadIPOrgRelationType.upload();
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with incorrect item", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([
      { ...defaultIPOrgRelationTypeItem, status: 4 },
    ]);
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrgRelationType = new UploadIPOrgRelationType(client);
    const result = await uploadIPOrgRelationType.upload();
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with created item", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([
      defaultIPOrgRelationTypeItem,
    ]);
    (updateIPOrgRelationType as any).mockResolvedValue({
      ...defaultIPOrgRelationTypeItem,
      status: 4,
    });

    (StoryProtocolKit.createIPOrgRelationType as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrgRelationType = new UploadIPOrgRelationType(client);
    const result = await uploadIPOrgRelationType.upload();
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(2);
    expect(StoryProtocolKit.createIPOrgRelationType).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with passed ip org", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([
      defaultIPOrgRelationTypeItem,
    ]);
    (updateIPOrgRelationType as any).mockResolvedValue({
      ...defaultIPOrgRelationTypeItem,
      status: 4,
    });

    (StoryProtocolKit.createIPOrgRelationType as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrgRelationType = new UploadIPOrgRelationType(client);
    const result = await uploadIPOrgRelationType.upload("123");
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(2);
    expect(StoryProtocolKit.createIPOrgRelationType).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with failed item", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([
      {
        ...defaultIPOrgRelationTypeItem,
        status: 3,
      },
    ]);
    (updateIPOrgRelationType as any).mockResolvedValue({
      ...defaultIPOrgRelationTypeItem,
      status: 4,
    });

    (StoryProtocolKit.createIPOrgRelationType as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationType = new UploadIPOrgRelationType(client);
    const result = await uploadRelationType.upload();
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPOrgRelationType).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 1,
    });
  });

  it("upload with sending item", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([
      { ...defaultIPOrgRelationTypeItem, status: 1 },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationType = new UploadIPOrgRelationType(client);
    const result = await uploadRelationType.upload();
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPOrgRelationType).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 1,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with sent item with tx_hash", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([
      { ...defaultIPOrgRelationTypeItem, status: 2 },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationType = new UploadIPOrgRelationType(client);
    const result = await uploadRelationType.upload();
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(1);
    expect(StoryProtocolKit.createIPOrgRelationType).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 1,
      failedItem: 0,
    });
  });

  it("upload with sent item without tx_hash", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([
      {
        ...defaultIPOrgRelationTypeItem,
        status: 2,
        tx_hash: undefined,
      },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationType = new UploadIPOrgRelationType(client);
    const result = await uploadRelationType.upload();
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPOrgRelationType).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 1,
      failedItem: 0,
    });
  });

  it("upload with created item but throw error", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([
      defaultIPOrgRelationTypeItem,
    ]);
    (updateIPOrgRelationType as any).mockResolvedValue({
      ...defaultIPOrgRelationTypeItem,
      status: 4,
    });

    (StoryProtocolKit.createIPOrgRelationType as any).mockImplementation(() => {
      throw new Error("createIPOrgRelationType error");
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationType = new UploadIPOrgRelationType(client);

    await expect(uploadRelationType.upload()).rejects.toThrow(
      "createIPOrgRelationType error"
    );
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(2);
    expect(StoryProtocolKit.createIPOrgRelationType).toBeCalledTimes(1);
  });

  it("upload without org_address throw error", async () => {
    (getIPOrgRelationTypes as any).mockResolvedValue([
      { ...defaultIPOrgRelationTypeItem, org_address: undefined },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadRelationType = new UploadIPOrgRelationType(client);

    await expect(uploadRelationType.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getIPOrgRelationTypes).toBeCalledTimes(1);
    expect(updateIPOrgRelationType).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPOrgRelationType).toBeCalledTimes(0);
  });
});
