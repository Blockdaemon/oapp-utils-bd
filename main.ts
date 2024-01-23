import { TransactionReceipt } from "web3";
import { JsonRpcProvider, Result, Wallet } from "ethers";

import {
  logConfig,
  mnemonic,
  networkChoice,
  networks,
  oAppAddress,
  endpointAddresses,
  blockdaemonRPCs,
  blockdaemonFujiOracleAddress,
  blockdaemonGoerliOracleAddress,
  blockdaemonMumbaiOracleAddress,
  messageLibAddress,
  targetChainEndpointID,
  sourceChainEndpointID,
} from "./common";

import { setOracle, getConfig } from "./interact-dvn";
const log = logConfig.getLogger("tool");

async function main() {
  log.info("Starting setting up the oracle");

  log.info("App address: " + oAppAddress);
  log.info("Network choice: " + networkChoice);
  log.info("Endpoints: " + endpointAddresses);

  if (
    !mnemonic ||
    !oAppAddress ||
    !networkChoice ||
    !networks ||
    !endpointAddresses ||
    !blockdaemonFujiOracleAddress ||
    !blockdaemonGoerliOracleAddress ||
    !blockdaemonMumbaiOracleAddress ||
    !messageLibAddress ||
    !targetChainEndpointID ||
    !sourceChainEndpointID
  ) {
    throw new Error("Ensure all variables are defined in your .env file");
  }
  let receipt: TransactionReceipt | undefined;
  const chosenRPC = blockdaemonRPCs[networkChoice];
  const provider = new JsonRpcProvider(chosenRPC);
  const hdWallet = Wallet.fromPhrase(mnemonic);

  // get signer from wallet
  const signer = hdWallet.connect(provider);

  let initialConfig: Result | undefined;
  let newConfig: Result | undefined;

  initialConfig = await getConfig(
    targetChainEndpointID,
    endpointAddresses[networkChoice],
    signer,
    messageLibAddress,
    oAppAddress
  );

  if (initialConfig) {
    log.info("Initial oracle: " + initialConfig[0][4]);
  }
  receipt = await setOracle(
    endpointAddresses[networkChoice],
    provider,
    signer,
    targetChainEndpointID,
    messageLibAddress,
    oAppAddress,
    true
  );

  if (!receipt) {
    log.error("Transaction unsuccessful");
  } else {
    log.trace(receipt);
    log.info("Change config transaction sent successfully");
    log.info("Waiting for 30 seconds for the oracle to update");
    // wait 20 seconds
    await new Promise((resolve) => setTimeout(resolve, 30000));

    newConfig = await getConfig(
      targetChainEndpointID,
      endpointAddresses[networkChoice],
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
