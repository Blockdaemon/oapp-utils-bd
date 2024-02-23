import { TransactionReceipt } from "web3";
import { JsonRpcProvider, Result, Wallet } from "ethers";

import {
  logConfig,
  mnemonic,
  sourceChain,
  oAppAddress,
  blockdaemonRPCs,
  messageLibAddress,
  targetChain,
} from "./utils/common";

import { endpointAddresses } from "./utils/chain-config";
import { setOracle, getConfig } from "./interact-dvn";
const log = logConfig.getLogger("tool");

async function main() {

  log.info("Starting setting up the oracle");

  log.info("App address: " + oAppAddress);
  log.info("Network choice: " + sourceChain);
  log.info("Endpoints: " + endpointAddresses);

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
  let receipt: TransactionReceipt | undefined;
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
    true
  );

  if (!receipt) {
    log.error("Transaction unsuccessful");
  } else {
    log.trace(receipt);
    log.info("Change config transaction sent successfully");
    log.info("Waiting for 120 seconds for the oracle to update");
    // wait 20 seconds
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
