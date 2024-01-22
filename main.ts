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
} from "./common";

import { setOracle, getConfig } from "./interact-dvn";
import { sign } from "web3/lib/commonjs/eth.exports";
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
    !blockdaemonMumbaiOracleAddress
  ) {
    throw new Error("Ensure all variables are defined in your .env file");
  }
  let receipt: TransactionReceipt | undefined;
  const chosenRPC = blockdaemonRPCs[networkChoice];
  const provider = new JsonRpcProvider(chosenRPC);
  const hdWallet = Wallet.fromPhrase(mnemonic);

  // get signer from wallet
  const signer = hdWallet.connect(provider);

  // ulnv2 (302), goerli

  const messageLibAddress = "0xb3f5e2ae7a0a7c4abc809730d8e5699020f466ef"; // https://docs.layerzero.network/contracts/messagelib-addresses
  const targetChainEndpointID = "40109"; // Mumbai, list:https://docs.layerzero.network/contracts/endpoint-addresses#testnet-addresses

  let config: Result | undefined;
  config = await getConfig(
    "40121",
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
    oAppAddress
  );

  if (!receipt) {
    log.error("Transaction unsuccessful");
  } else {
    log.trace(receipt);
    log.info("Change config transaction sent successfully");

      config = await getConfig(
        "40121",
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
