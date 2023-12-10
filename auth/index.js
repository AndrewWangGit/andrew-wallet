const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("../config.js");
const ethers = require("ethers");
const User = require("./schema/User.js");

mongoose.connect(config.mongoUri);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const app = express();
app.use(express.json());
const PORT = 4000;

app.get("/", (res, req) => {
  res.status(200).send("Auth Server v1.0");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const existing = await User.findOne({ username: username });

  if (existing) {
    return res.status(400).json({ error: "Username in use!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = User({
    username: username,
    password: hashedPassword,
  });

  await newUser.save();

  res.status(200).json({ message: "Successfully registered new account!" });
});

app.post("/login", async (req, res) => {
  const { username, password, userOpHash } = req.body;

  const user = await User.findOne({ username: username });

  if (!user) {
    return res
      .status(400)
      .json({ error: "No such user with that username exists!" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: "Password for user is incorrect!" });
  }

  const signature = await getSignature(username, userOpHash);

  res.status(200).json({ signature: signature });
});

const getSignature = async (username, userOpHash) => {
  const provider = new ethers.AlchemyProvider("goerli", config.alchemyApi);
  const signer = new ethers.Wallet(config.privateKey, provider);

  // encode the hash and the username
  const abi = ethers.AbiCoder.defaultAbiCoder();
  const message = abi.encode(["bytes32", "string"], [userOpHash, username]);
  const hashedMessage = ethers.keccak256(message);

  // sign the message
  const userOpHashBytes = ethers.getBytes(hashedMessage);
  const signature = await signer.signMessage(userOpHashBytes);
  return signature;
};

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}!`);
});
