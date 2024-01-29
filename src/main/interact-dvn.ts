import { TransactionReceipt } from "web3";
import {
  JsonRpcProvider,
  Contract,
  AbiCoder,
  HDNodeWallet,
  parseUnits,
  Result,
} from "ethers";

import {
  logConfig,
  networkChoice,
  networks,
  blockdaemonFujiOracleAddress,
  blockdaemonGoerliOracleAddress,
  blockdaemonMumbaiOracleAddress,
  getABIfromJson,
} from "./utils/common";
import { defaultBlockConfs } from "./utils/chain-config";

const log = logConfig.getLogger("tool");

export async function setOracle(
  endpoint: string,
  web3: JsonRpcProvider,
  signer: HDNodeWallet,
  remoteChainEndpointID: string,
  messageLibAddress: string,
  oappAddress: string,
  gas: boolean
): Promise<TransactionReceipt | undefined> {
  if (endpoint === "") {
    throw new Error("Endpoint address not defined");
  }
  const abi = await getABIfromJson("endpoint.json");
  if (!abi) {
    throw new Error("ABI not found");
  }
  const endpointContract = new Contract(endpoint, abi, signer);
  const encoder = AbiCoder.defaultAbiCoder();

  const choice = networkChoice ? networks[networkChoice] : "goerli";
  const confirmations = networkChoice? defaultBlockConfs[networkChoice] || 0: 0;
  const requiredDVNsCount = 1;
  const optionalDVNsCount = 0;
  const optionalDVNsThreshold = 0;
  const requiredDVNs =
    choice === "fuji"
      ? [blockdaemonFujiOracleAddress]
      : choice === "mumbai"
      ? [blockdaemonMumbaiOracleAddress]
      : [blockdaemonGoerliOracleAddress];
  //const optionalDVNs = [] as any;
  const optionalDVNs: any[] = []; // 0x0000000000000000000000000000000000000000
  const configTypeUln = 2;

  log.info("oappAddress: " + oappAddress);
  log.info("messageLibAddress: " + messageLibAddress);
  // same as     ["uint64", "uint8", "uint8", "uint8", "address[]", "address[]"],

  const ulnConfigEncoding =
    "tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs) UlnConfig";

  const ulnConfigEncoded = encoder.encode(
    [ulnConfigEncoding],
    [
      [confirmations,
      requiredDVNsCount,
      optionalDVNsCount,
      optionalDVNsThreshold,
      requiredDVNs,
      optionalDVNs,
    ]
  ]
  );

  log.info("ULN Encoded config: " + ulnConfigEncoded);

  const setConfigParamUln = {
    eid: remoteChainEndpointID, // Replace with your remote chain's endpoint ID (source or destination)
    configType: configTypeUln,
    config: ulnConfigEncoded,
  };

  log.info("OApp Encoded config: " + JSON.stringify(setConfigParamUln));

  const areWeReady = await endpointContract.isSupportedEid(
    remoteChainEndpointID
  );
  if (!areWeReady) {
    throw new Error("Endpoint not supported");
  }

  // uses approximately 40k gas
  let options = {};
  if (gas) {
    options = {
      gasLimit: 500000,
      gasPrice: parseUnits("23000000000", "wei"),
    }    
  }
  try {
    const tx = await endpointContract.setConfig(
      oappAddress,
      messageLibAddress,
      [setConfigParamUln],
      options
    );

    log.info("Transaction hash: " + tx.hash);

    return tx;
  } catch (err) {
    log.error(err);
  }
}

export async function getConfig(
  eid: string,
  endpoint: string,
  signer: HDNodeWallet,
  messageLibAddress: string,
  oappAddress: string
): Promise<Result | undefined> {
  const abi = await getABIfromJson("endpoint.json");
  if (!abi) {
    throw new Error("ABI not found");
  }
  try {
    const endpointContract = new Contract(endpoint, abi, signer);
    const encoder = AbiCoder.defaultAbiCoder();

    const ulnConfigBytes = await endpointContract.getConfig(
      oappAddress,
      messageLibAddress,
      eid,
      2
    );

    const ulnConfigAbi = [
      "tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)",
    ];

    const ulnConfigArray = encoder.decode(ulnConfigAbi, ulnConfigBytes);
    return ulnConfigArray;
  } catch (err) {
    log.error(err);
  }
}
