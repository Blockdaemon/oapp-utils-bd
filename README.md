# LayerZeroV2 Oracle Setup

This tool sets up the Animoca-Blockdaemon joint DVN (AB-BD) for an Oapp.

### Requirements

This is a Typescript project. Npm as package manager and node. Tested with npm v10.2.4, node 21.5.0. We recommend using [nvm](https://github.com/nvm-sh/nvm) for node version management.

## Getting started

Our DVN currently supports the following chains:
| **Chain**        | **Endpoint ID** | **Env variable NETWORK** | **DVN Address**                          |
|------------------|-----------------|--------------------------|------------------------------------------|
| Ethereum (mainnet) | 30101          | ethereum                 | 0x7E65BDd15C8Db8995F80aBf0D6593b57dc8BE437 |
| Avalanche (mainnet) | 30106         | avalanche                | 0xFfe42DC3927A240f3459e5ec27EAaBD88727173E |
| Polygon (mainnet)  | 30109          | polygon                  | 0xa6F5DDBF0Bd4D03334523465439D301080574742 |
| Optimism (mainnet) | 30111          | optimism                 | 0x7B8a0fD9D6ae5011d5cBD3E85Ed6D5510F98c9Bf |
| Fantom (mainnet)   | 30112          | fantom                   | 0x313328609a9C38459CaE56625FFf7F2AD6dcde3b |

Our tool currently supports changing the DVN of all above networks except BSC and Arbitrum (coming soon).

### Running the tool

1. Install node 21.5.0 (using nvm: `nvm install 21.5.0 && nvm use 21.5.0`)

2. Install the dependencies with `npm install`.

3. Copy the environment variables with `cp .env.example .env`.

4. Populate the variables, including your Blockdaemon API Key (BLOCKDAEMON_API_KEY), the private key that you will be using to sign transactions in the form of a mnemonic (MNEMONIC), the address of your LayerZero v2 application (OAPP_ADDRESS), the network you are operating on (SOURCE_NETWORK), and the destination/target network (TARGET_NETWORK). Make sure to choose a supported network, according to the above table.

5. If you need, set the message library address (MESSAGE_LIB_ADDRESS). We are using the default library. Libraries can be consulted here: https://docs.layerzero.network/contracts/messagelib-addresses.

6. Run the main script with `npx ts-node src/main/main.ts`. The script waits two minutes before confirming a change in the oracle, to accommodate for finalization times.

## FAQ

#### Which chains does this tool support?

A: This tool supports mainnet AB-BD-powered DNVs, except for Arbitrum and BSC.
