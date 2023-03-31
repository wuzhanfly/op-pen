export const INFURA_ID = "4a500de3b58c4ee29f06f412c041669c";
export const ETHERSCAN_KEY = "QMP1FA66IBMXKV6BCYKQNR7KQK8YXNNN83";
export const BLOCKNATIVE_DAPPID = "df450101-191f-48e3-b4ec-47f72f020c2d";
export const ALCHEMY_KEY = "Jj5c-Azqc4hWd7bvrarKEB01uckWMWrM";

export const NETWORKS = {
  localhost: {
    name: "Localhost",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://" + (global.window ? window.location.hostname : "localhost") + ":8545",
  },
  mainnet: {
    name: "Mainnet",
    color: "#ff8b9e",
    chainId: 1,
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
    blockExplorer: "https://etherscan.io/",
  },
  goerli: {
    name: "Goerli",
    color: "#7003DD",
    chainId: 5,
    faucet: "https://goerli-faucet.slock.it/",
    blockExplorer: "https://goerli.etherscan.io/",
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_ID}`,
  },
  goerliArbitrum: {
    name: "Arbitrum Testnet Goerli",
    color: "#50a0ea",
    chainId: 421613,
    blockExplorer: "https://goerli.arbiscan.io",
    rpcUrl: `https://goerli-rollup.arbitrum.io/rpc`,
  },
  arbitrum: {
    name: "Arbitrum",
    color: "#50a0ea",
    chainId: 42161,
    blockExplorer: "https://explorer.arbitrum.io/#/",
    rpcUrl: `https://arb1.arbitrum.io/rpc`,
    gasPrice: 0,
  },
  goerliOptimism: {
    name: "GoerliOptimism",
    color: "#f01a37",
    chainId: 420,
    blockExplorer: "https://goerli-explorer.optimism.io",
    rpcUrl: `https://opt-goerli.g.alchemy.com/v2/h_-n5x_H-5OX0uS4_dgm944Er8RxQF07`,
    gasPrice: 25000000,
  },

  penOptimism: {
    name: "PenOptimism",
    color: "#f01a37",
    chainId: 42069,
    blockExplorer: "https://scan-testnet-op.penchain.xyz/",
    rpcUrl: `https://rpc-testnet-op.penchain.xyz/`,
    gasPrice: 25000000,
  },
  optimism: {
    name: "Optimism",
    color: "#f01a37",
    chainId: 10,
    blockExplorer: "https://optimistic.etherscan.io/",
    rpcUrl: `https://mainnet.optimism.io`,
  },
};

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};
