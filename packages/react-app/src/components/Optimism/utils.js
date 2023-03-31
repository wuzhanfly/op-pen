export const invalidSignerForTargetNetwork = (crossChainMessenger, targetNetwork) => {
  console.log(targetNetwork.chainId, targetNetwork.name);
  if (!crossChainMessenger) {
    return true;
  }
  if (targetNetwork.chainId === 5) {
    try {
      crossChainMessenger.l1Signer;
    } catch (e) {
      return true;
    }
  }

  if (targetNetwork.chainId === 42069) {
    try {
      crossChainMessenger.l2Signer;
    } catch (e) {
      return true;
    }
  }

  return false;
};

export const ethL2Token = "0x61D0a6748Ac0572594D240452ac1721dDd9DafC0";
