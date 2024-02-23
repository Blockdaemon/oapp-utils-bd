export type SupportedNetwork =
  | "ethereum"
  | "avalanche"
  | "polygon"
  | "optimism"
  | "fantom";



// testnet list here https://docs.layerzero.network/contracts/endpoint-addresses
export const endpointAddresses: Record<SupportedNetwork, string> = {
  // fuji: "0x6edce65403992e310a62460808c4b910d972f10f",
  // mumbai: "0x6edce65403992e310a62460808c4b910d972f10f",
  // mainnets
  ethereum: "0x1a44076050125825900e736c501f859c50fe728c",
  avalanche: "0x1a44076050125825900e736c501f859c50fe728c",
  polygon: "0x1a44076050125825900e736c501f859c50fe728c",
  optimism: "0x1a44076050125825900e736c501f859c50fe728c",
  fantom: "0x1a44076050125825900e736c501f859c50fe728c",
  // bsc: "0x1a44076050125825900e736c501f859c50fe728c",
  // arbitrum: "0x1a44076050125825900e736c501f859c50fe728c",
};
export const eidToEndpointAddressMap: { [key: string]: string } = {
  "30101": "0x1a44076050125825900e736c501f859c50fe728c", // Ethereum
  // "30102": "0x1a44076050125825900e736c501f859c50fe728c", // BNB Chain (BSC)
  "30106": "0x1a44076050125825900e736c501f859c50fe728c", // Avalanche
  "30109": "0x1a44076050125825900e736c501f859c50fe728c", // Polygon
  // "30110": "0x1a44076050125825900e736c501f859c50fe728c", // Arbitrum
  "30111": "0x1a44076050125825900e736c501f859c50fe728c", // Optimism
  "30112": "0x1a44076050125825900e736c501f859c50fe728c", // Fantom
  // "40106": "0x6edce65403992e310a62460808c4b910d972f10f", // Fuji (Avalanche Testnet)
  // "40109": "0x6edce65403992e310a62460808c4b910d972f10f", // Mumbai (Polygon Testnet)
};

// Adjusting EndpointId type to string literals
type EndpointId = "30101" | "30106" | "30109" | "30111" | "30112";

const idToChainNameMap: { [key in EndpointId]: string } = {
  "30101": "ethereum",
  // "30102": "BNB Chain (BSC)",
  "30106": "avalanche",
  "30109": "polygon",
  // "30110": "arbitrum",
  "30111": "optimism",
  "30112": "fantom",
}

// Definition of supported networks
export function networkNameToEndpointID(
  networkName: SupportedNetwork
): string | undefined {
  // Retrieve the endpoint address using the network name
  const endpointAddress = endpointAddresses[networkName];

  // Find the endpoint ID that matches the endpoint address
  const endpointID = Object.keys(eidToEndpointAddressMap).find(
    (id) => eidToEndpointAddressMap[id] === endpointAddress
  );

  return endpointID; // This will be undefined if no match is found
}


export function getEndpointIDByName(
  networkName: string
): EndpointId | undefined {
  const endpointID = Object.keys(idToChainNameMap).find(
    (key) =>
      idToChainNameMap[key as EndpointId].toLowerCase() ===
      networkName.toLowerCase()
  ) as EndpointId | undefined;

  if (!endpointID) {
    console.error(`No endpoint ID found for network name: ${networkName}`);
    return undefined;
  }

  return endpointID;
}
