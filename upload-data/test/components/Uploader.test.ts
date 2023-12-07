import { afterEach, describe, it, expect, jest } from "@jest/globals";
import { Uploader } from "../../src/components/Uploader";

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

describe("Uploader", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("uploadText", async () => {
    (StoryClient.newClient as any).mockImplementation(() => {
      return {
        platform: {
          uploadFile: jest.fn().mockReturnValue({ uri: "www.google.com" }),
        },
      };
    });
    const client = StoryClient.newClient({} as StoryConfig);
    const uploader = new Uploader(client);
    const result = await uploader.uploadText("content");
    expect(result).toEqual("www.google.com");
  });

  it("uploadImage", async () => {
    (StoryClient.newClient as any).mockImplementation(() => {
      return {
        platform: {
          uploadFile: jest.fn().mockReturnValue({ uri: "www.google.com" }),
        },
      };
    });

    const client = StoryClient.newClient({} as StoryConfig);
    const uploader = new Uploader(client);
    const result = await uploader.uploadImage("upload-data/package.json");
    expect(result).toEqual("www.google.com");
  });
});
