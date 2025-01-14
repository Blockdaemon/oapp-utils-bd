import dotenv from "dotenv";
import log4js from "log4js";
import { promises as fs } from "fs";
import path from "path";
import { HDNodeWallet, parseEther, parseUnits } from "ethers";
import { SupportedNetwork } from "./chain-config";

dotenv.config();

const logLevel = process.env.LOG_LEVEL || "debug";
export const logConfig: log4js.Log4js = log4js.configure({
  appenders: {
    console: { type: "console" },
  },
  categories: {
    default: {
      appenders: ["console"],
      level: logLevel,
    },
  },
});

export const API_KEY: string =
  process.env.BLOCKDAEMON_API_KEY ||
  (() => {
    console.log("BLOCKDAEMON_API_KEY is not defined");
    throw new Error("BLOCKDAEMON_API_KEY is not defined");
  })();

export const mnemonic: string | undefined = process.env.MNEMONIC;
export const oAppAddress: string | undefined = process.env.OAPP_ADDRESS;

export const messageLibAddress: string | undefined =
  process.env.MESSAGE_LIB_ADDRESS;

export const ETHEREUM_RPC =
  "https://svc.blockdaemon.com/ethereum/mainnet/native?apiKey=YOUR_API_KEY".replace(
    "YOUR_API_KEY",
    API_KEY
  );
export const AVALANCHE_RPC =
  "https://svc.blockdaemon.com/avalanche/mainnet/native?apiKey=YOUR_API_KEY".replace(
    "YOUR_API_KEY",
    API_KEY
  );
export const POLYGON_RPC =
  "https://svc.blockdaemon.com/polygon/mainnet/native/http-rpc?apiKey=YOUR_API_KEY".replace(
    "YOUR_API_KEY",
    API_KEY
  );
export const OPTIMISM_RPC =
  "https://svc.blockdaemon.com/optimism/mainnet/native/http-rpc?apiKey=YOUR_API_KEY".replace(
    "YOUR_API_KEY",
    API_KEY
  );
export const FANTOM_RPC =
  "https://svc.blockdaemon.com/fantom/mainnet/native/http-rpc?apiKey=YOUR_API_KEY".replace(
    "YOUR_API_KEY",
    API_KEY
  );
export const BASE_RPC =
  "https://svc.blockdaemon.com/base/mainnet/native/http-rpc?apiKey=YOUR_API_KEY".replace(
    "YOUR_API_KEY",
    API_KEY
  );

export const ARBITRUM_RPC =
  "https://svc.blockdaemon.com/arbitrum/mainnet/native/http-rpc?apiKey=YOUR_API_KEY".replace(
    "YOUR_API_KEY",
    API_KEY
  );

export const sourceChain: SupportedNetwork | undefined = (() => {
  const rawNetworkChoice = process.env.SOURCE_NETWORK;

  if (!rawNetworkChoice) {
    return undefined;
  }
  if (
    rawNetworkChoice === "ethereum" ||
    rawNetworkChoice === "avalanche" ||
    rawNetworkChoice === "polygon" ||
    rawNetworkChoice === "optimism" ||
    rawNetworkChoice === "base" ||
    // rawNetworkChoice === "bnb" || // no rpc support
    rawNetworkChoice === "arbitrum" ||
    rawNetworkChoice === "fantom"
  ) {
    return rawNetworkChoice as SupportedNetwork;
  } else {
    throw new Error("Invalid network choice. Please refer to the readme and the docs at https://docs.blockdaemon.com/reference/rpc-api-overview");
  }
})();

export const targetChain: SupportedNetwork | undefined = (() => {
  const rawNetworkChoice = process.env.TARGET_NETWORK;

  if (!rawNetworkChoice) {
    return undefined;
  }
  if (
    rawNetworkChoice === "ethereum" ||
    rawNetworkChoice === "avalanche" ||
    rawNetworkChoice === "polygon" ||
    rawNetworkChoice === "optimism" ||
    rawNetworkChoice === "base" ||
    // rawNetworkChoice === "bnb" || // no rpc support
    rawNetworkChoice === "arbitrum" ||
    rawNetworkChoice === "fantom"
  ) {
    return rawNetworkChoice as SupportedNetwork;
  } else {
    throw new Error("Invalid network choice. Please refer to the docs.");
  }
})();

export const blockdaemonRPCs: { [key: string]: string } = {
  ethereum: ETHEREUM_RPC as string,
  avalanche: AVALANCHE_RPC as string,
  polygon: POLYGON_RPC as string,
  optimism: OPTIMISM_RPC as string,
  fantom: FANTOM_RPC as string,
  base: BASE_RPC as string,
  arbitrum: ARBITRUM_RPC as string,
};

export const blockdaemonEthereumOracleAddress: string =
  "0x7E65BDd15C8Db8995F80aBf0D6593b57dc8BE437";

export const blockdaemonAvalancheOracleAddress: string =
  "0xFfe42DC3927A240f3459e5ec27EAaBD88727173E";

export const blockdaemonPolygonOracleAddress: string =
  "0xa6F5DDBF0Bd4D03334523465439D301080574742";

export const blockdaemonOptimismOracleAddress: string =
  "0x7B8a0fD9D6ae5011d5cBD3E85Ed6D5510F98c9Bf";

export const blockdaemonFantomOracleAddress: string =
  "0x313328609a9C38459CaE56625FFf7F2AD6dcde3b";

export const blockdaemonArbitrumAddress: string =
  "0xddaa92ce2d2fac3f7c5eae19136e438902ab46cc";

 export const blockdaemonBNBAddress: string =
  "0x313328609a9c38459cae56625fff7f2ad6dcde3b";

 export const blockdaemonBaseAddress: string =
  "0x41ef29f974fc9f6772654f005271c64210425391";

export async function getABIfromJson(
  filename: string
): Promise<any | undefined> {
  try {
    const filePath = path.join(
      path.join(__dirname, path.join("../../../")),
      path.join("data/abi", filename)
    );
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading file:", error);
    return undefined;
  }
}

export async function sendEther(
  wallet: HDNodeWallet,
  recipientAddress: string,
  amountInEther: string
) {
  const tx = {
    to: recipientAddress,
    value: parseEther(amountInEther),
    gasPrice: parseUnits("23000000000", "wei"),
    gasLimit: 21000,
  };

  try {
    const createReceipt = await wallet.sendTransaction(tx);
    console.log("Transaction hash:", createReceipt.hash);

    const receipt = await createReceipt.wait();
    console.log("Receipt:", receipt);

    return receipt;
  } catch (error) {
    console.error("Error sending Ether:", error);
    throw error;
  }
}
