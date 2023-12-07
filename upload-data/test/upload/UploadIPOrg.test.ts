import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { UploadIPOrg } from "../../src/upload/UploadIPOrg";

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

jest.mock("../../src/query/iporg", () => ({
  getIpOrgs: jest.fn(),
  updateIPOrg: jest.fn(),
}));

import { PrismaClient } from "@prisma/client";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { getIpOrgs, updateIPOrg } from "../../src/query/iporg";
import { StoryProtocolKit } from "../../src/components/StoryProtocolKit";

describe("UploadIPOrg", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const defaultIPOrgItem = {
    id: "id",
    org_address: "org_address",
    name: "name",
    symbol: "symbol",
    owner: "owner",
    ip_asset_types: '["1", "2", "3", "4", "5", "6"]',
    tx_hash: "tx_hash",
    status: 0,
  };

  it("UploadIPOrg constructor", () => {
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    expect(uploadIPOrg.prisma).toBeInstanceOf(PrismaClient);
    expect(uploadIPOrg.client).toEqual(client);
  });

  it("closeConnection function", async () => {
    (PrismaClient as any).mockImplementation(() => {
      return {
        $disconnect: jest.fn(),
      };
    });
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    await uploadIPOrg.closeConnection();
    expect(uploadIPOrg.prisma.$disconnect).toBeCalledTimes(1);
  });

  it("upload with empty item", async () => {
    (getIpOrgs as any).mockResolvedValue([]);
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with incorrect item", async () => {
    (getIpOrgs as any).mockResolvedValue([{ ...defaultIPOrgItem, status: 4 }]);
    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with created item", async () => {
    (getIpOrgs as any).mockResolvedValue([defaultIPOrgItem]);
    (updateIPOrg as any).mockResolvedValue({ ...defaultIPOrgItem, status: 4 });

    (StoryProtocolKit.createIPOrg as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipOrgId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(2);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload without ip_asset_types", async () => {
    (getIpOrgs as any).mockResolvedValue([
      { ...defaultIPOrgItem, ip_asset_types: "" },
    ]);
    (updateIPOrg as any).mockResolvedValue({ ...defaultIPOrgItem, status: 4 });

    (StoryProtocolKit.createIPOrg as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipOrgId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(2);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload without owner", async () => {
    (getIpOrgs as any).mockResolvedValue([
      { ...defaultIPOrgItem, owner: undefined },
    ]);
    (updateIPOrg as any).mockResolvedValue({ ...defaultIPOrgItem, status: 4 });

    (StoryProtocolKit.createIPOrg as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipOrgId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(2);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload passed ip org", async () => {
    (getIpOrgs as any).mockResolvedValue([defaultIPOrgItem]);
    (updateIPOrg as any).mockResolvedValue({ ...defaultIPOrgItem, status: 4 });

    (StoryProtocolKit.createIPOrg as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipOrgId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload("123");
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(2);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(1);
    expect(result).toEqual({
      newItem: 1,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with failed item", async () => {
    (getIpOrgs as any).mockResolvedValue([{ ...defaultIPOrgItem, status: 3 }]);
    (updateIPOrg as any).mockResolvedValue({ ...defaultIPOrgItem, status: 4 });

    (StoryProtocolKit.createIPOrg as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipOrgId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 0,
      failedItem: 1,
    });
  });

  it("upload with sending item", async () => {
    (getIpOrgs as any).mockResolvedValue([{ ...defaultIPOrgItem, status: 1 }]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 1,
      sentItem: 0,
      failedItem: 0,
    });
  });

  it("upload with sent item with org_address", async () => {
    (getIpOrgs as any).mockResolvedValue([{ ...defaultIPOrgItem, status: 2 }]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(1);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 1,
      failedItem: 0,
    });
  });

  it("upload with sent item without org_address", async () => {
    (getIpOrgs as any).mockResolvedValue([
      { ...defaultIPOrgItem, org_address: undefined, status: 2 },
    ]);

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    const result = await uploadIPOrg.upload();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(0);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(0);
    expect(result).toEqual({
      newItem: 0,
      sendingItem: 0,
      sentItem: 1,
      failedItem: 0,
    });
  });

  it("upload with created item but throw error", async () => {
    (getIpOrgs as any).mockResolvedValue([defaultIPOrgItem]);
    (updateIPOrg as any).mockResolvedValue({ ...defaultIPOrgItem, status: 4 });

    (StoryProtocolKit.createIPOrg as any).mockImplementation(() => {
      throw new Error("createIPOrg error");
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");

    await expect(uploadIPOrg.upload()).rejects.toThrow("createIPOrg error");
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(2);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(1);
  });

  it("upload throw error but sent transaction", async () => {
    (getIpOrgs as any).mockResolvedValue([defaultIPOrgItem]);
    (updateIPOrg as any)
      .mockImplementationOnce(() => {
        return { ...defaultIPOrgItem, status: 1 };
      })
      .mockImplementationOnce(() => {
        throw new Error("updateIPOrg error");
      })
      .mockImplementationOnce(() => {
        return { ...defaultIPOrgItem, status: 2 };
      });
    (StoryProtocolKit.createIPOrg as any).mockResolvedValue({
      txHash:
        "0xc236bc7efe6c96cc554018a3688d309c74fe9b23a00b57d858196f6a98b2471b",
      ipOrgId: "1",
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploadIPOrg = new UploadIPOrg(client, "");
    await expect(uploadIPOrg.upload()).rejects.toThrow();
    await new Promise(process.nextTick);
    expect(getIpOrgs).toBeCalledTimes(1);
    expect(updateIPOrg).toBeCalledTimes(3);
    expect(StoryProtocolKit.createIPOrg).toBeCalledTimes(1);
  });
});
