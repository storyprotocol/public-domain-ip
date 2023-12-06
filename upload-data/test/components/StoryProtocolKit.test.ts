import { afterEach, describe, it, expect, jest } from "@jest/globals";
import { StoryProtocolKit } from "../../src/components/StoryProtocolKit";

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

import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

describe("StoryProtocolKit", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("createIPOrg", () => {
    (StoryClient.newClient as any).mockImplementation(() => {
      return {
        ipOrg: {
          create: jest
            .fn()
            .mockReturnValue({ txHash: "txHash", ipOrgId: "ipOrgId" }),
        },
      };
    });
    const client = StoryClient.newClient({} as StoryConfig);
    const ipOrg = {
      name: "name",
      symbol: "symbol",
      owner: "owner",
      assetTypes: [],
    };
    const result = StoryProtocolKit.createIPOrg(client, ipOrg);
    expect(result).toEqual({ txHash: "txHash", ipOrgId: "ipOrgId" });
  });

  it("createIPOrgRelationType", () => {
    (StoryClient.newClient as any).mockImplementation(() => {
      return {
        relationshipType: {
          register: jest
            .fn()
            .mockReturnValue({ txHash: "txHash", success: true }),
        },
      };
    });
    const client = StoryClient.newClient({} as StoryConfig);
    const orgRelationType = {
      ipOrg: "ipOrg",
      relType: "relType",
      allowedElements: {
        src: 1,
        dst: 1,
      },
      allowedSrcs: [1],
      allowedDsts: [1],
    };
    const result = StoryProtocolKit.createIPOrgRelationType(
      client,
      orgRelationType
    );
    expect(result).toEqual({ txHash: "txHash", success: true });
  });

  it("createIPOrgRelationType without ipOrg", () => {
    const client = StoryClient.newClient({} as StoryConfig);
    const orgRelationType = {
      ipOrg: "",
      relType: "relType",
      allowedElements: {
        src: 1,
        dst: 1,
      },
      allowedSrcs: [1],
      allowedDsts: [1],
    };

    expect(() =>
      StoryProtocolKit.createIPOrgRelationType(client, orgRelationType)
    ).toThrow("ipOrg is null");
  });

  it("createIPAsset", () => {
    (StoryClient.newClient as any).mockImplementation(() => {
      return {
        ipAsset: {
          create: jest
            .fn()
            .mockReturnValue({ txHash: "txHash", ipAssetId: "ipAssetId" }),
        },
      };
    });
    const client = StoryClient.newClient({} as StoryConfig);
    const ipAsset = {
      name: "name",
      ipAssetType: 1,
      orgAddress: "orgAddress",
      owner: "owner",
      mediaUrl: "mediaUrl",
      hash: "hash",
    };
    const result = StoryProtocolKit.createIPAsset(client, ipAsset);
    expect(result).toEqual({ txHash: "txHash", ipAssetId: "ipAssetId" });
  });

  it("createRelationship", () => {
    (StoryClient.newClient as any).mockImplementation(() => {
      return {
        relationship: {
          register: jest.fn().mockReturnValue({
            txHash: "txHash",
            relationshipId: "relationshipId",
          }),
        },
      };
    });
    const client = StoryClient.newClient({} as StoryConfig);
    const ipAssetRelation = {
      relType: "relType",
      orgAddress: "orgAddress",
      srcAddress: "srcAddress",
      dstAddress: "dstAddress",
      srcId: "srcId",
      dstId: "dstId",
      srcType: "srcType",
      dstType: "dstType",
    };
    const result = StoryProtocolKit.createRelationship(client, ipAssetRelation);
    expect(result).toEqual({
      txHash: "txHash",
      relationshipId: "relationshipId",
    });
  });
});
