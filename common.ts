import dotenv from "dotenv";
import log4js from "log4js";
import { promises as fs } from "fs";
import path from "path";
import { HDNodeWallet, parseEther, parseUnits } from "ethers";

type SupportedNetworks = "mainnet" | "sepolia" | "goerli";

dotenv.config();

export const logConfig: log4js.Log4js = log4js.configure({
  appenders: {
    console: { type: "console" },
  },
  categories: {
    default: { appenders: ["console"], level: "debug" },
  },
});

export const mnemonic: string | undefined = process.env.MNEMONIC;
export const oAppAddress: string | undefined = process.env.OAPP_ADDRESS;
export const API_KEY: string | undefined = process.env.BLOCKDAEMON_API_KEY;
export const messageLibAddress: string | undefined =
  process.env.MESSAGE_LIB_ADDRESS;
export const targetChainEndpointID: string | undefined =
  process.env.TARGET_CHAIN_ENDPOINT_ID;
export const sourceChainEndpointID: string | undefined =
  process.env.SOURCE_CHAIN_ENDPOINT_ID;

export const mainnetRPC: string | undefined = process.env.MAINNET_RPC?.replace(
  "YOUR_API_KEY",
  process.env.BLOCKDAEMON_API_KEY || ""
);

export const goerliRPC: string | undefined = process.env.GOERLI_RPC?.replace(
  "YOUR_API_KEY",
  process.env.BLOCKDAEMON_API_KEY || ""
);
export const mumbaiRPC: string | undefined = process.env.MUMBAI_RPC?.replace(
  "YOUR_API_KEY",
  process.env.BLOCKDAEMON_API_KEY || ""
);
export const fujiRPC: string | undefined = process.env.FUJI_RPC?.replace(
  "YOUR_API_KEY",
  process.env.BLOCKDAEMON_API_KEY || ""
);

export const blockdaemonRPCs: { [key: string]: string } = {
  goerli: goerliRPC as string,
  fuji: fujiRPC as string,
  mumbai: mumbaiRPC as string,
};

export const networkChoice: SupportedNetworks | undefined = (() => {
  const rawNetworkChoice = process.env.NETWORK;

  if (!rawNetworkChoice) {
    return undefined;
  }

  if (
    rawNetworkChoice === "mumbai" ||
    rawNetworkChoice === "fuji" ||
    rawNetworkChoice === "goerli"
  ) {
    return rawNetworkChoice as SupportedNetworks;
  } else {
    throw new Error("Invalid network choice. Please refer to the docs.");
  }
})();

export const networks: { [key: string]: string } = {
  mainnet: mainnetRPC as string,
  goerli: goerliRPC as string,
};
export const endpointAddresses: { [key: string]: string } = {
  mainnet: "",
  goerli: "0x464570adA09869d8741132183721B4f0769a0287",
};

export const blockdaemonGoerliOracleAddress: string =
  "0xe695699B08bdDd9922079332625e5Df265dEfA50";
export const blockdaemonFujiOracleAddress: string =
  "0xfb310c2ae76670f61f2ca48a514e9e3fae8282b6";
export const blockdaemonMumbaiOracleAddress: string =
  "0x6aac22d61015383f5293c415979f5cbd5f2dd8e2";

export async function getABIfromJson(
  filename: string
): Promise<any | undefined> {
  try {
    const filePath = path.join(__dirname, path.join("abi", filename));
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
    // Send the transaction
    const createReceipt = await wallet.sendTransaction(tx);
    console.log("Transaction hash:", createReceipt.hash);

    // Wait for the transaction to be mined
    const receipt = await createReceipt.wait();
    console.log("Receipt:", receipt);

    return receipt;
  } catch (error) {
    console.error("Error sending Ether:", error);
    throw error;
  }
}
