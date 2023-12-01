import { privateKeyToAccount } from "viem/accounts";
import { Chain, Transport, Hex } from "viem";
import { StoryClient } from "@story-protocol/core-sdk";
import { Client } from "@story-protocol/core-sdk/dist/declarations/src/types/client";

export type ClientKitOptions = {
  privateKey: Hex;
  chain?: Chain;
  transport?: Transport;
};

export class ClientKit {
  public accountAddress: string;
  public client: Client;

  constructor(options: ClientKitOptions) {
    const account = privateKeyToAccount(options.privateKey);
    this.client = StoryClient.newClient({
      account,
      chain: options.chain,
      transport: options.transport,
    });
    this.accountAddress = account.address;
  }
}
