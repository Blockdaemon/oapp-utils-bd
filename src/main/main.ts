import { TransactionReceipt } from "web3";
import { ContractTransactionResponse, JsonRpcProvider, Result, Wallet } from "ethers";

import {
  logConfig,
  mnemonic,
  sourceChain,
  oAppAddress,
  blockdaemonRPCs,
  messageLibAddress,
  targetChain,
} from "./utils/common";

import { SupportedNetwork, endpointAddresses } from "./utils/chain-config";
import { setOracle, getConfig } from "./interact-dvn";
const log = logConfig.getLogger("tool");

async function main() {

  log.info("Starting setting up the oracle");

  log.info("App address: " + oAppAddress);
  log.info("Network choice: " + sourceChain);
  log.info("Endpoints: " + JSON.stringify(endpointAddresses));

  if (
    !mnemonic ||
    !oAppAddress ||
    !sourceChain ||
    !endpointAddresses ||
    !messageLibAddress ||
    !targetChain
  ) {
    throw new Error("Ensure all variables are defined in your .env file");
  }
  let receipt: TransactionReceipt | ContractTransactionResponse | undefined;
  const chosenRPC = blockdaemonRPCs[sourceChain];
  const provider = new JsonRpcProvider(chosenRPC);
  const hdWallet = Wallet.fromPhrase(mnemonic);

  // get signer from wallet
  const signer = hdWallet.connect(provider);

  let initialConfig: Result | undefined;
  let newConfig: Result | undefined;

  log.debug("Target chain endpoint ID: " + targetChain);
  initialConfig = await getConfig(
    sourceChain,
    targetChain,
    signer,
    messageLibAddress,
    oAppAddress
  );

  if (initialConfig) {
    log.info("Initial oracle: " + initialConfig[0][4]);
  }

  receipt = await setOracle(
    sourceChain,
    targetChain,
    signer,
    messageLibAddress,
    oAppAddress,
    false
  );

  if (!receipt) {
    log.error("Transaction unsuccessful");
  } else {
    printReceipt(receipt, sourceChain);

    log.info("Waiting for 120 seconds for the oracle to update");
    await new Promise((resolve) => setTimeout(resolve, 120000));

    newConfig = await getConfig(
      sourceChain,
      targetChain,
      signer,
      messageLibAddress,
      oAppAddress
    );

    if (newConfig)  {
      log.info("Updated oracle: " + newConfig[0][4]);
    }
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});

function printReceipt(receipt: ContractTransactionResponse, chain: SupportedNetwork) {
  let scannerURL = "";
  log.trace("Receipt: " + JSON.stringify(receipt, null, 2));
  log.debug("Transaction hash: " + receipt.hash);
  log.debug("ChainID: " + receipt.chainId);
  switch (chain) {
    case "ethereum":
      scannerURL = "https://etherscan.io/tx/";
      break;
    case "avalanche":
      scannerURL = "https://avascan.info/blockchain/c/tx/";
      break;
    case "polygon":
      scannerURL = "https://polygonscan.com/tx/";
      break;
    case "optimism":
      scannerURL = "https://optimistic.etherscan.io/tx/";
      break;
    case "fantom":
      scannerURL = "https://ftmscan.com/tx/";
      break;
    default:
      log.error("Chain not supported");
  }
  log.info("Access your transaction here: " + scannerURL + receipt.hash);
}
