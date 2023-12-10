const options = {
  method: "POST",
  headers: { accept: "application/json", "content-type": "application/json" },
  body: JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: "eth_sendUserOperation",
    params: [
      {
        sender: "",
        nonce: "0x0",
        initCode: "0x",
        callData:
          "0xb61d27f60000000000000000000000000be71941d041a32fe7df4a61eb2fcff3b03502c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004d087d28800000000000000000000000000000000000000000000000000000000",
        callGasLimit: "0x30D40",
        verificationGasLimit: "0x30D40",
        preVerificationGas: "0x30D40",
        maxFeePerGas: "0x30D40",
        maxPriorityFeePerGas: "0x30D40",
        signature: "",
        paymasterAndData: "0x",
      },
      "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    ],
  }),
};

fetch(
  "https://eth-goerli.g.alchemy.com/v2/_L0G9JnFSg-0zB6Kr28tcu46woVR8TNM",
  options
)
  .then((response) => response.json())
  .then((response) => console.log(response))
  .catch((err) => console.error(err));
