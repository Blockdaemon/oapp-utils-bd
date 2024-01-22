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
import { sign } from "web3/lib/commonjs/eth.exports";
const log = logConfig.getLogger("tool");

async function main() {
  // grab parameters from executable
  const args = process.argv.slice(2);
  log.info("Args: " + args);
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

  let config: Result | undefined;
  config = await getConfig(
    sourceChainEndpointID,
    endpointAddresses["goerli"],
    signer,
    messageLibAddress,
    oAppAddress
  );

  const initialOracle = config?.toArray();
  log.info("Initial oracle: " + initialOracle);

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

      config = await getConfig(
        sourceChainEndpointID,
        endpointAddresses["goerli"],
        signer,
        messageLibAddress,
        oAppAddress
      );

      const chosenOracle = config?.toArray();
      log.info("Updated oracle: " + chosenOracle);
  }
}

main().catch((err) => {
  log.error("There was an error");
  log.debug(err);
});
