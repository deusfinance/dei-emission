import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
          optimizer: {
            enabled: true,
            runs: 100000,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic:
          "weekend friend since level unaware voyage lazy spring put three grunt power",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 5,
      },
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 3,
      gas: "auto",
      minGasPrice: 1000000000,
      initialBaseFeePerGas: 360000000,
      gasPrice: "auto",
      gasMultiplier: 1.2,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 4,
      gas: "auto",
      gasPrice: 3100000000,
      gasMultiplier: 1.2,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 1,
      gas: "auto",
      gasPrice: 22000000000,
      gasMultiplier: 1.2,
    },
    heco: {
      url: "https://http-mainnet.hecochain.com",
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 128,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.2,
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 43114,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.2,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 43113,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.2,
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 137,
      gas: "auto",
      gasPrice: 45100000000,
      gasMultiplier: 1.2,
    },
    fantom: {
      url: `https://rpc.ankr.com/fantom/${process.env.ANKR_API_KEY}`,
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 250,
      gas: "auto",
      gasPrice: 400100000000, //500.1 Gwei
      gasMultiplier: 1.2,
    },
    bsctest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 97,
      gas: "auto",
      gasPrice: 10e9, // 10 Gwei
      gasMultiplier: 1.2,
    },
    bsc: {
      url: "https://bsc-dataseed1.ninicoin.io/",
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 56,
      gas: "auto",
      gasPrice: 10e9, // 10 Gwei
      gasMultiplier: 1.2,
    },
    metis: {
      url: "https://andromeda.metis.io/?owner=1088",
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 1088,
      gas: "auto",
      gasPrice: 23e9, // 23 Gwei
      gasMultiplier: 1.2,
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [
        process.env.MAIN_DEPLOYER_PRIVATE_KEY!,
        process.env.SECOND_DEPLOYER_PRIVATE_KEY!,
        process.env.DEI_DEPLOYER_PRIVATE_KEY!,
        process.env.DEUS_DEPLOYER_PRIVATE_KEY!,
        process.env.veDEUS_DEPLOYER_PRIVATE_KEY!,
      ],
      chainId: 42161,
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.2,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,
      rinkeby: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      kovan: process.env.ETHERSCAN_API_KEY,
      // binance smart chain
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
      // huobi eco chain
      heco: "YOUR_HECOINFO_API_KEY",
      hecoTestnet: "YOUR_HECOINFO_API_KEY",
      // fantom mainnet
      opera: process.env.FANTOM_API_KEY,
      ftmTestnet: process.env.FANTOM_API_KEY,
      // optimism
      optimisticEthereum: "YOUR_OPTIMISTIC_ETHERSCAN_API_KEY",
      optimisticKovan: "YOUR_OPTIMISTIC_ETHERSCAN_API_KEY",
      // polygon
      polygon: process.env.POLYGON_API_KEY,
      polygonMumbai: process.env.POLYGON_API_KEY,
      // arbitrum
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      arbitrumTestnet: process.env.ARBISCAN_API_KEY,
      // avalanche
      avalanche: "YOUR_SNOWTRACE_API_KEY",
      avalancheFujiTestnet: "YOUR_SNOWTRACE_API_KEY",
      // moonbeam
      moonbeam: "YOUR_MOONBEAM_MOONSCAN_API_KEY",
      moonriver: "YOUR_MOONRIVER_MOONSCAN_API_KEY",
      moonbaseAlpha: "YOUR_MOONBEAM_MOONSCAN_API_KEY",
      // harmony
      harmony: "YOUR_HARMONY_API_KEY",
      harmonyTest: "YOUR_HARMONY_API_KEY",
      // xdai and sokol don't need an API key, but you still need
      // to specify one; any string placeholder will work
      xdai: "api-key",
      sokol: "api-key",
      aurora: "api-key",
      auroraTestnet: "api-key",
    },
  },
};

export default config;
