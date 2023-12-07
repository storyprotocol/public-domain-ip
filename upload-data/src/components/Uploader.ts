import { Client } from "@story-protocol/core-sdk/dist/declarations/src/types/client";
import { readFileSync } from "fs";
import { fileLogger } from "../utils/WLogger";

export const MimeType = {
  text: "text/plain",
  image: "image/jpg",
};

export class Uploader {
  public client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async uploadText(content: string): Promise<string> {
    const file = Buffer.from(content);
    const { uri } = await this.client.platform.uploadFile(file, MimeType.text);
    return uri;
  }

  public async uploadImage(fileLocation: string): Promise<string> {
    const finalLocation: string = process.env.IMAGE_PATH + fileLocation;
    fileLogger.info(`image location : ${finalLocation}`);
    const file = readFileSync(finalLocation);
    const { uri } = await this.client.platform.uploadFile(file, MimeType.image);
    return uri;
  }
}
