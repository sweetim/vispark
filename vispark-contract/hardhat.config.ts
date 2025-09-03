import hardhatKeystore from "@nomicfoundation/hardhat-keystore";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import type { HardhatUserConfig } from "hardhat/config";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
	plugins: [hardhatToolboxViemPlugin, hardhatKeystore],
	solidity: {
		profiles: {
			default: {
				version: "0.8.28",
			},
			production: {
				version: "0.8.28",
				settings: {
					optimizer: {
						enabled: true,
						runs: 200,
					},
				},
			},
		},
	},
	networks: {
		hardhatMainnet: {
			type: "edr-simulated",
			chainType: "l1",
		},
		hardhatOp: {
			type: "edr-simulated",
			chainType: "op",
		},
		"0g-testnet": {
			type: "http",
			url: "https://evmrpc-testnet.0g.ai",
			chainId: 16601,
			accounts: [configVariable("OG_TESTNET_PRIVATE_KEY")],
		},
	},
};

export default config;
