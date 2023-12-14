const ethers = require("ethers");
const base64url = require("base64url");

const sender = "0x17Df2313de36E158e94B855b5e90bD97bEd376dF";
const nonce = 0;
const initCode = "0x";
const callData =
  "0xb61d27f60000000000000000000000000be71941d041a32fe7df4a61eb2fcff3b03502c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000004d087d28800000000000000000000000000000000000000000000000000000000";
const callGasLimit = 0x1312D00;
const verificationGasLimit = 0x1312D00;
const preVerificationGas = 0x1312D00;
const maxFeePerGas = 0x1312D00;
const maxPriorityFeePerGas = 0x1312D00;
const paymasterAndData = "0x";

const getEncodedABI = (id_token, base64urlModulus, base64urlExponent) => {
  const parts = id_token.split(".");
  const JSON_string = base64url.decode(parts[1]);
  const _data =
    "0x" +
    base64url.toBuffer(base64url(parts[0] + "." + parts[1])).toString("hex");
  const _m = "0x" + base64url.toBuffer(base64urlModulus).toString("hex");
  const _e = "0x" + base64url.toBuffer(base64urlExponent).toString("hex");
  const _s = "0x" + base64url.toBuffer(parts[2]).toString("hex");

  const abi = ethers.AbiCoder.defaultAbiCoder();
  const encoded = abi.encode(
    ["string", "bytes", "bytes", "bytes", "bytes"],
    [JSON_string, _data, _m, _e, _s]
  );

  return encoded;
};

const id_token =
  "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBhZDFmZWM3ODUwNGY0NDdiYWU2NWJjZjVhZmFlZGI2NWVlYzllODEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiNjI5MDc1MTQ1ODE0LTBpbDVhZDlkZ2tsYWQ2b2xubGExMG5lYm5xYzVuMnVqLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiNjI5MDc1MTQ1ODE0LTBpbDVhZDlkZ2tsYWQ2b2xubGExMG5lYm5xYzVuMnVqLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTA0NzU1NjYxMTQxMzY0NzM5NTU1IiwiZW1haWwiOiJhbmRyZXcudGoud2FuZ0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Il9fSUtWak85MFAzdEFJdzcwS0pZcXciLCJub25jZSI6IjB4NGE4MjM3YTJjYTBjMWM4MzNkODk3MWE0ZjcxYzczNTZjMzg2MTAyZGIwYjNiZTJjMDI1NTY5ZTU2N2NmNjVhNSIsImlhdCI6MTcwMjUzMDQwMCwiZXhwIjoxNzAyNTM0MDAwfQ.fSGcSqAz3Z53cOS667-JVEf95sz5dMoeUnjaP-c2qoz0Od52OTRREfaBq9hBPuF1w6DSHC5OV9aFdAOrIZcE0v0k9zv_i4vYNWLZi1RCFZMdnWm9NG9tl5vGBHB09Z8L-4yLBhwZGD4w7eRQ-8onzzaHZ7YtwM2SVz4bOGH9RPSchln56fwqgwEpu1s-g0rLHz4_WWyMz2Fbqp65ogt1YPhtex-bV08dFI8_KQ1CCMe4EC1rTqx_VP8wTZPDWw2BFTM5e7qsu9DPDJG-1ubgteenCHxv5o_qge7hLxoyo-maQeqS-gT4jMiqQqx2q1AIzT_rMz1dJiWxoQQkkt08tQ";
const n =
  "sm72oBH-R2Rqt4hkjp66tz5qCtq42TMnVgZg2Pdm_zs7_-EoFyNs9sD1MKsZAFaBPXBHDiWywyaHhLgwETLN9hlJIZPzGCEtV3mXJFSYG-8L6t3kyKi9X1lUTZzbmNpE0tf-eMW-3gs3VQSBJQOcQnuiANxbSXwS3PFmi173C_5fDSuC1RoYGT6X3JqLc3DWUmBGucuQjPaUF0w6LMqEIy0W_WYbW7HImwANT6dT52T72md0JWZuAKsRRnRr_bvaUX8_e3K8Pb1K_t3dD6WSLvtmEfUnGQgLynVl3aV5sRYC0Hy_IkRgoxl2fd8AaZT1X_rdPexYpx152Pl_CHJ79Q";
const e = "AQAB";

const encoded = getEncodedABI(id_token, n, e);
console.log(encoded);
