import { useEffect, useState } from "react";
import { Button, Input, Spin } from "antd";

export default function ERC20Deploy({ writeContracts, tx }) {
  const [l1TokenAddress, setL1TokenAddress] = useState("");
  const [l2TokenAddress, setL2TokenAddress] = useState("");

  const [deployState, setDeployState] = useState("NOT_STARTED");
  let l2DeployView = <></>;
  switch (deployState) {
    case "NOT_STARTED":
      l2DeployView = <></>;
      break;
    case "DEPLOYING":
      l2DeployView = <Spin />;
      break;
    case "DEPLOYED":
      l2DeployView = <Input value={l2TokenAddress} />;
      break;
  }

  const deployToL2 = async () => {
    try {
      setDeployState("DEPLOYING");
      console.log(writeContracts);
      const result = await tx(writeContracts.L2TokenFactory.createStandardL2Token(l1TokenAddress, "GOLD", "GLD"));
      console.log(result);
      if (!result || result.code === 4001) {
        setDeployState("NOT_STARTED");
        return;
      }

      const receipt = await result.wait();
      console.log(receipt);

      const args = receipt.events.find(({ event }) => event === "StandardL2TokenCreated").args;

      // Get the L2 token address from the emmited event and log
      const address = args._l2Token;
      setL2TokenAddress(address);
      setDeployState("DEPLOYED");
      console.log("L2StandardERC20 deployed to:", l2TokenAddress);
    } catch (error) {
      console.log(error);
      setDeployState("NOT_STARTED");
    }
  };

  return (
    <div style={{ margin: 15 }}>
      <p style={{ margin: "auto", wordBreak: "break-word", maxWidth: "75vw" }}>
        Deploy an ERC20 onto Optimism with the corresponding L1 address. This uses the Optimism StandardTokenFactory
        contract, and deploys a new instance of the L2StandardERC20 contract.
      </p>
      <div style={{ margin: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            width: "500px",
          }}
        >
          <Input
            placeholder="L1 Token Address"
            value={l1TokenAddress}
            onChange={e => setL1TokenAddress(e.target.value)}
          />
          <Button type="primary" onClick={deployToL2}>
            Deploy to L2
          </Button>
          {l2DeployView}
        </div>
      </div>
    </div>
  );
}
