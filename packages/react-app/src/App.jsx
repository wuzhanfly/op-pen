import Portis from "@portis/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Alert, Button, Col, Menu, Row, List, Radio, Input, Card } from "antd";
import "antd/dist/antd.css";
import { useBalance, useGasPrice, useOnBlock, useOnRepetition, useUserProviderAndSigner } from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import WalletLink from "walletlink";
import Web3Modal from "web3modal";
import "./App.css";
import {
  Account,
  Contract,
  Deposit,
  DepositTxs,
  ERC20Deploy,
  ERC20Deposit,
  ERC20Withdraw,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
  Withdraw,
  WithdrawTxs,
} from "./components";
import { NETWORK, NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor } from "./helpers";
import { useContractLoader } from "eth-hooks";
const { ethers } = require("ethers");
const optimismSDK = require("@eth-optimism/sdk");
const targetNetwork = NETWORKS.goerli;

const targetL1 = NETWORKS.goerli;
const l1Provider = new ethers.providers.JsonRpcProvider(targetL1.rpcUrl);

const targetL2 = NETWORKS.penOptimism;
const l2Provider = new ethers.providers.StaticJsonRpcProvider(targetL2.rpcUrl);
const l2TokenAddress = "0x7759e3e1d4a49aa17d029ecc5c8c3a1952360a6f";

console.log("targetNetwork", targetNetwork);
// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`)
  : null;

const localProviderUrl = targetNetwork.rpcUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrl);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrl);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`, 1);

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
    },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
    },
  },
});

function App(props) {
  const mainnetProvider = mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  console.log("🔥 userProviderAndSigner:", userProviderAndSigner);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  const tx = Transactor(userSigner, gasPrice);
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, selectedChainId);
  // input L1 contracts address to init bridges
  const zeroAddr = "0x".padEnd(42, "0");
  const l1Contracts = {
    StateCommitmentChain: zeroAddr,
    CanonicalTransactionChain: zeroAddr,
    BondManager: zeroAddr,
    AddressManager: "0xEb9bF3C90b1d3ED73713f29e9C79A287C50e006d", // Lib_AddressManager.json
    L1CrossDomainMessenger: "0x232903d65f058c94957c8bB5942775264faFC69f", // Proxy__OVM_L1CrossDomainMessenger.json
    L1StandardBridge: "0xD267904d2D4b6FD38a41Fb2fA547C2A5E124f142", // Proxy__OVM_L1StandardBridge.json
    OptimismPortal: "0xc1f6CB9144a62e23EAA5014950709879617c0541", // OptimismPortalProxy.json
    L2OutputOracle: "0xC4a5A26fAFAb352d5e4D286b4b521b4cDb59b98b", // L2OutputOracleProxy.json
  };
  const bridges = {
    Standard: {
      l1Bridge: l1Contracts.L1StandardBridge,
      l2Bridge: "0x4200000000000000000000000000000000000010",
      Adapter: optimismSDK.StandardBridgeAdapter,
    },
    ETH: {
      l1Bridge: l1Contracts.L1StandardBridge,
      l2Bridge: "0x4200000000000000000000000000000000000010",
      Adapter: optimismSDK.ETHBridgeAdapter,
    },
  };
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });
  useEffect(() => {
    if (DEBUG && mainnetProvider && address && selectedChainId && yourLocalBalance && yourMainnetBalance) {
      console.log("_____________________________________ op-pen  _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("💵 yourMainnetBalance", yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : "...");
    }
  }, [mainnetProvider, address, selectedChainId, yourLocalBalance, yourMainnetBalance]);
  let networkDisplay = "";
  if (NETWORKCHECK && selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    if (selectedChainId === 1337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      console.log("networkSelected.name:", networkSelected.name);
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);

                    let switchTx;
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: data[0].chainId }],
                      });
                    } catch (switchError) {
                      try {
                        switchTx = await ethereum.request({
                          method: "wallet_addEthereumChain",
                          params: data,
                        });
                      } catch (addError) {
                        // handle "add" error
                      }
                    }

                    if (switchTx) {
                      console.log(switchTx);
                    }
                  }}
                >
                  <b>{targetNetwork && targetNetwork.name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    const path = window.location.pathname;
    setRoute(path);
    console.log("🚀 route", path);
  }, [route]);
  const getDepositTxs = async (crossChainMessenger, address) => {
    if (!crossChainMessenger) {
      return [];
    }

    return await crossChainMessenger.getDepositsByAddress(address);
  };

  const getWithdrawTxs = async (crossChainMessenger, address) => {
    if (!crossChainMessenger) {
      return [];
    }

    return await crossChainMessenger.getWithdrawalsByAddress(address);
  };

  const [crossChainMessenger, setCrossChainMessenger] = useState(null);
  useEffect(() => {
    const chainId = userSigner?.provider?.network?.chainId;
    if (!chainId) return;
    if (chainId === targetL1.chainId) {
      setCrossChainMessenger(
        new optimismSDK.CrossChainMessenger({
          bedrock: true,
          contracts: {
            l1: l1Contracts,
          },
          bridges: bridges,
          l1SignerOrProvider: userSigner,
          l2SignerOrProvider: l2Provider,
          l1ChainId: targetL1.chainId,
          l2ChainId: targetL2.chainId,
        }),
      );
    } else if (chainId === targetL2.chainId) {
      setCrossChainMessenger(
        new optimismSDK.CrossChainMessenger({
          bedrock: true,
          contracts: {
            l1: l1Contracts,
          },
          bridges: bridges,
          l1SignerOrProvider: l1Provider,
          l2SignerOrProvider: userSigner,
          l1ChainId: targetL1.chainId,
          l2ChainId: targetL2.chainId,
        }),
      );
    } else {
      setCrossChainMessenger(null);
    }
  }, [userSigner]);

  const [deposits, setDeposits] = useState([]);
  useEffect(() => {
    if (!crossChainMessenger || !address) {
      return;
    }
    const getDeposits = async () => {
      const deposits = await getDepositTxs(crossChainMessenger, address);
      console.log("Deposits", deposits);

      setDeposits(deposits);
    };
    getDeposits();
  }, [crossChainMessenger, yourLocalBalance]);

  const [withdrawTxs, setWithdrawTxs] = useState([]);
  useEffect(() => getDepositsAndWithdraws(), [yourLocalBalance]);
  useOnRepetition(() => getDepositsAndWithdraws(), {
    pollTime: 45000,
    provider: l1Provider,
  });

  const getDepositsAndWithdraws = async () => {
    if (!crossChainMessenger) return;

    const getWithdraws = async () => {
      const wd = await getWithdrawTxs(crossChainMessenger, address);
      console.log("withdraws", wd);
      setWithdrawTxs(wd);
    };

    const getDeposits = async () => {
      const deposits = await getDepositTxs(crossChainMessenger, address);
      setDeposits(deposits);
    };

    getWithdraws();
    getDeposits();
  };

  const [l1TokenAddress, setL1TokenAddress] = useState();
  useEffect(() => {
    if (readContracts?.PGF) {
      setL1TokenAddress(readContracts.PGF.address);
    }
  }, [readContracts.PGF]);

  return (
    <div className="App">
      <Header />
      {networkDisplay}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Deposit
            </Link>
          </Menu.Item>
          <Menu.Item key="/withdraw">
            <Link
              onClick={() => {
                setRoute("/withdraw");
              }}
              to="/withdraw"
            >
              Withdraw
            </Link>
          </Menu.Item>
          {/*<Menu.Item key="/erc20-deploy">*/}
          {/*  <Link*/}
          {/*    onClick={() => {*/}
          {/*      setRoute("/erc20-deploy");*/}
          {/*    }}*/}
          {/*    to="/erc20-deploy"*/}
          {/*  >*/}
          {/*    ERC20 Deploy*/}
          {/*  </Link>*/}
          {/*</Menu.Item>*/}
          {/*<Menu.Item key="/erc20-deposit">*/}
          {/*  <Link*/}
          {/*    onClick={() => {*/}
          {/*      setRoute("/erc20-deposit");*/}
          {/*    }}*/}
          {/*    to="/erc20-deposit"*/}
          {/*  >*/}
          {/*    ERC20 Deposit*/}
          {/*  </Link>*/}
          {/*</Menu.Item>*/}
          {/*<Menu.Item key="/erc20-withdraw">*/}
          {/*  <Link*/}
          {/*    onClick={() => {*/}
          {/*      setRoute("/erc20-withdraw");*/}
          {/*    }}*/}
          {/*    to="/erc20-withdraw"*/}
          {/*  >*/}
          {/*    ERC20 Withdraw*/}
          {/*  </Link>*/}
          {/*</Menu.Item>*/}
        </Menu>

        <Switch>
          <Route exact path="/">
            <Deposit
              address={address}
              mainnetProvider={mainnetProvider}
              targetNetwork={targetNetwork}
              crossChainMessenger={crossChainMessenger}
              l1Provider={l1Provider}
              l2Provider={l2Provider}
            ></Deposit>
          </Route>
          <Route exact path="/withdraw">
            <Withdraw
              address={address}
              mainnetProvider={mainnetProvider}
              targetNetwork={targetNetwork}
              crossChainMessenger={crossChainMessenger}
              l1Provider={l1Provider}
              l2Provider={l2Provider}
            ></Withdraw>
          </Route>
          <Route exact path="/erc20-deploy">
            <ERC20Deploy writeContracts={writeContracts} tx={tx}></ERC20Deploy>
          </Route>
          <Route exact path="/erc20-deposit">
            <ERC20Deposit
              address={address}
              balance={yourLocalBalance}
              readContracts={readContracts}
              crossChainMessenger={crossChainMessenger}
              l1TokenAddress={l1TokenAddress}
              l2TokenAddress={l2TokenAddress}
            ></ERC20Deposit>
          </Route>
          <Route exact path="/erc20-withdraw">
            <ERC20Withdraw
              address={address}
              balance={yourLocalBalance}
              contractConfig={contractConfig}
              crossChainMessenger={crossChainMessenger}
              l2Provider={l2Provider}
              l1TokenAddress={l1TokenAddress}
              l2TokenAddress={l2TokenAddress}
            ></ERC20Withdraw>
          </Route>
          <Route exact path="/debug">
            <Contract
              name="PGF"
              price={price}
              signer={userSigner}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              contractConfig={contractConfig}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 20 }}>
        <DepositTxs
          price={price}
          deposits={deposits}
          mainnetProvider={mainnetProvider}
          localProvider={localProvider}
        ></DepositTxs>
        <WithdrawTxs
          price={price}
          deposits={deposits}
          mainnetProvider={mainnetProvider}
          localProvider={localProvider}
          withdrawTxs={withdrawTxs}
          crossChainMessenger={crossChainMessenger}
        ></WithdrawTxs>
        <ThemeSwitch />
      </div>

      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={14}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
