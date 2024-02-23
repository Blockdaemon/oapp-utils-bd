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
  targetChain,
  blockdaemonRPCs,
  getABIfromJson,
  blockdaemonAvalancheOracleAddress,
  blockdaemonEthereumOracleAddress,
  blockdaemonFantomOracleAddress,
  blockdaemonOptimismOracleAddress,
  blockdaemonPolygonOracleAddress,
} from "./utils/common";
import {
  SupportedNetwork,
  networkNameToEndpointID,
  eidToEndpointAddressMap,
} from "./utils/chain-config";

const log = logConfig.getLogger("tool");

export async function setOracle(
  sourceChain: SupportedNetwork,
  targetChain: SupportedNetwork,
  signer: HDNodeWallet,
  messageLibAddress: string,
  oappAddress: string,
  gas: boolean
): Promise<TransactionReceipt | undefined> {
  const abi = await getABIfromJson("endpoint.json");
  if (!abi) {
    throw new Error("ABI not found");
  }
  const eid = networkNameToEndpointID(sourceChain as SupportedNetwork);
  if (!eid) {
    throw new Error("Endpoint id not found");
  }

  const endpoint = eidToEndpointAddressMap[eid];
  const endpointContract = new Contract(endpoint, abi, signer);
  const encoder = AbiCoder.defaultAbiCoder();
  const remoteChainEndpointID = networkNameToEndpointID(targetChain);
  const requiredDVNs = getRequiredDVNs(targetChain);
  // do not change confirmations: use the LZ defaults
  const confirmations = 0;
  const requiredDVNsCount = 1;
  const optionalDVNsCount = 0;
  const optionalDVNsThreshold = 0;
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
      [
        confirmations,
        requiredDVNsCount,
        optionalDVNsCount,
        optionalDVNsThreshold,
        requiredDVNs,
        optionalDVNs,
      ],
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
      gasPrice: parseUnits("40000000000", "wei"),
    };
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
  sourceChain: string,
  targetChain: string,
  signer: HDNodeWallet,
  messageLibAddress: string,
  oappAddress: string
): Promise<Result | undefined> {
  const abi = await getABIfromJson("endpoint.json");
  if (!abi) {
    throw new Error("ABI not found");
  }
  try {
    const targetEid = networkNameToEndpointID(targetChain as SupportedNetwork);
    const eid = networkNameToEndpointID(sourceChain as SupportedNetwork);
    if (!eid) {
      throw new Error("Endpoint id not found");
    }
    const endpoint = eidToEndpointAddressMap[eid];
    log.info("Endpoint for source chain:", eid);

    log.info("Endpoint address: ", endpoint);
    log.info("Endpoint id: ", eid);
    if (!endpoint) {
      throw new Error("Endpoint address is undefined or null.");
    }

    const endpointContract = new Contract(endpoint, abi, signer);
    const encoder = AbiCoder.defaultAbiCoder();

    const ulnConfigBytes = await endpointContract.getConfig(
      oappAddress,
      messageLibAddress,
      targetEid,
      2
    );

    const ulnConfigAbi = [
      "tuple(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)",
    ];

    const ulnConfigArray = encoder.decode(ulnConfigAbi, ulnConfigBytes);
    return ulnConfigArray;
  } catch (err) {
    log.error(err);
    throw new Error("Error getting config");
  }
}

function getRequiredDVNs(choice: string): string[] {
  switch (choice) {
    case "ethereum":
      return [blockdaemonEthereumOracleAddress];
    case "avalanche":
      return [blockdaemonAvalancheOracleAddress];
    case "polygon":
      return [blockdaemonPolygonOracleAddress];
    case "optimism":
      return [blockdaemonOptimismOracleAddress];
    case "fantom":
      return [blockdaemonFantomOracleAddress];
    default:
      return [blockdaemonEthereumOracleAddress]; // Default to Fuji if none match
  }
}
