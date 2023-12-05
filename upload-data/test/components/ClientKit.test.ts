import { afterEach, describe, it, expect, jest } from "@jest/globals";
import { ClientKit, ClientKitOptions } from "../../src/components/ClientKit";
import { Hex, http } from "viem";
import { sepolia } from "viem/chains";

const privateKey: string =
  "0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa";

const rpcURL = "https://1rpc.io/sepolia";

let replacedEnv: jest.Replaced<typeof process.env> | undefined = undefined;

describe("ClientKit", () => {
  afterEach(() => {
    replacedEnv?.restore();
  });
  it("Create ClientKit without chain", () => {
    const options: ClientKitOptions = {
      privateKey: privateKey as Hex,
      transport: http(rpcURL),
    };
    const clientKit = new ClientKit(options);
    expect(clientKit).toBeTruthy();
    expect(clientKit.client).toBeTruthy();
  });
  it("Create ClientKit without transport", () => {
    const options: ClientKitOptions = {
      privateKey: privateKey as Hex,
      chain: sepolia,
    };
    const clientKit = new ClientKit(options);
    expect(clientKit).toBeTruthy();
    expect(clientKit.client).toBeTruthy();
  });

  it("Create ClientKit without transport and chain", () => {
    const options: ClientKitOptions = {
      privateKey: privateKey as Hex,
    };
    const clientKit = new ClientKit(options);
    expect(clientKit).toBeTruthy();
    expect(clientKit.client).toBeTruthy();
  });

  it("Create ClientKit with transport and chain", () => {
    const options: ClientKitOptions = {
      privateKey: privateKey as Hex,
      chain: sepolia,
      transport: http(rpcURL),
    };
    const clientKit = new ClientKit(options);
    expect(clientKit).toBeTruthy();
    expect(clientKit.client).toBeTruthy();
  });
});
