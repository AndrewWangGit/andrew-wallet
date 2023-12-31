const ethers = require("ethers");

const sender = "0x2294AE33083c0Db9f9f30E43F6710F04E2903476";
const nonce = 0;
const initCode = "0x";
const callData =
  "0xb61d27f60000000000000000000000000be71941d041a32fe7df4a61eb2fcff3b03502c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004d087d28800000000000000000000000000000000000000000000000000000000";
const callGasLimit = 0x4C4B40;
const verificationGasLimit = 0x4C4B40;
const preVerificationGas = 0x4C4B40;
const maxFeePerGas = 0x4C4B40;
const maxPriorityFeePerGas = 0x4C4B40;
const paymasterAndData = "0x";

const hashInitCode = ethers.keccak256(initCode);
const hashCallData = ethers.keccak256(callData);
const hashPaymasterAndData = ethers.keccak256(paymasterAndData);

const abi = ethers.AbiCoder.defaultAbiCoder();
const packed = abi.encode(
  [
    "address",
    "uint256",
    "bytes32",
    "bytes32",
    "uint256",
    "uint256",
    "uint256",
    "uint256",
    "uint256",
    "bytes32",
  ],
  [
    sender,
    nonce,
    hashInitCode,
    hashCallData,
    callGasLimit,
    verificationGasLimit,
    preVerificationGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    hashPaymasterAndData,
  ]
);
const hash = ethers.keccak256(packed);

const userOpHash = ethers.keccak256(
  abi.encode(
    ["bytes32", "address", "uint256"],
    [hash, "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", 0x5]
  )
);

console.log("userOpHash: ", userOpHash);
