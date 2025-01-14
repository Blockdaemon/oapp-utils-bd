export type SupportedNetwork =
  | "ethereum"
  | "avalanche"
  | "polygon"
  | "optimism"
  | "arbitrum"
  | "base"
  | "fantom";

// testnet list here https://docs.layerzero.network/contracts/endpoint-addresses
export const endpointAddresses: Record<SupportedNetwork, string> = {
  ethereum: "0x7e65bdd15c8db8995f80abf0d6593b57dc8be437",
  avalanche: "0xffe42dc3927a240f3459e5ec27eaabd88727173e",
  polygon: "0xa6f5ddbf0bd4d03334523465439d301080574742",
  optimism: "0x7b8a0fd9d6ae5011d5cbd3e85ed6d5510f98c9bf",
  arbitrum: "0xddaa92ce2d2fac3f7c5eae19136e438902ab46cc",
  fantom: "0x313328609a9c38459cae56625fff7f2ad6dcde3b",
  base: "0x41ef29f974fc9f6772654f005271c64210425391",
  // bnb: "0x313328609a9c38459cae56625fff7f2ad6dcde3b", // no rpc support
};
export const eidToEndpointAddressMap: { [key: string]: string } = {
  "30101": "0x7e65bdd15c8db8995f80abf0d6593b57dc8be437", // Ethereum
  "30106": "0xffe42dc3927a240f3459e5ec27eaabd88727173e", // Avalanche
  "30109": "0xa6f5ddbf0bd4d03334523465439d301080574742", // Polygon
  "30111": "0x7b8a0fd9d6ae5011d5cbd3e85ed6d5510f98c9bf", // Optimism
  "30110": "0xddaa92ce2d2fac3f7c5eae19136e438902ab46cc", // Arbitrum
  "30112": "0x313328609a9c38459cae56625fff7f2ad6dcde3b", // Fantom
  "30184": "0x41ef29f974fc9f6772654f005271c64210425391", // Fantom
  // "30102": "0x313328609a9c38459cae56625fff7f2ad6dcde3b", // BNB
};

type EndpointId = "30101" | "30106" | "30109" | "30110" | "30111" | "30112" | "30184"; // | "30102"

const idToChainNameMap: { [key in EndpointId]: SupportedNetwork } = {
  "30101": "ethereum",
  "30106": "avalanche",
  "30109": "polygon",
  "30110": "arbitrum",
  "30111": "optimism",
  "30112": "fantom",
  "30184": "base",
  // "30102": "bnb",
};

// Definition of supported networks
export function networkNameToEndpointID(
  networkName: SupportedNetwork
): string | undefined {

  const endpointID = Object.keys(idToChainNameMap).find(
    (id) => idToChainNameMap[id as EndpointId] === networkName
  );

  return endpointID;
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
