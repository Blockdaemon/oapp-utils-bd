export type SupportedNetworks = "goerli" | "fuji" | "mumbai";

// recommendations here https://layerzero.gitbook.io/docs/technical-reference/mainnet/default-config
// can set custom confirmations by  const confirmations = networkChoice? customBlockConfs[networkChoice] || 0: 0;
export const customBlockConfs: Record<SupportedNetworks, number> = {
  goerli: 15,
  fuji: 12,
  mumbai: 512,
};

// testnet list here https://docs.layerzero.network/contracts/endpoint-addresses
export const endpointAddresses: Record<SupportedNetworks, string> = {
  goerli: "0x464570adA09869d8741132183721B4f0769a0287",
  fuji: "0x464570adA09869d8741132183721B4f0769a0287",
  mumbai: "0x464570adA09869d8741132183721B4f0769a0287",
};
