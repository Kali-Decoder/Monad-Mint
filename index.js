const express = require("express");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");
const dotenv = require("dotenv");
const { NFT_ADDRESS, NFT_ABI } = require("./constant");
const ethers = require("ethers");
dotenv.config();
const app = express();
const corsOptions = {
  origin: true, // This will enable CORS for all origins
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/mint-monad-nft", async (req, res) => {
  const { receiverAddress } = req.query;
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet("0x" + process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);

  if (!signer) {
    return res.status(400).json({ message: "Signer is required" });
  }

  if (!receiverAddress) {
    return res.status(400).json({ message: "Receiver address is required" });
  }

  try {
    let balance = await contract.balanceOf(receiverAddress);
    if (Number(balance) > 0) {
      return res.status(400).json({
        message: "Receiver already has an NFT",
      });
    }

    const tokenId = await contract.tokenId();
    const tx = await contract.mintNFT(receiverAddress, process.env.NFT_URI, {
      from: signer.address,
    });
    await tx.wait();
    return res.status(200).json({
      message: "NFT minted successfully",
      tokenId: tokenId.toString(),
      transaction: `https://monad-testnet.socialscan.io/tx/${tx.hash}`,
    });
  } catch (error) {
    console.log(error);
  }
});

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minutes
  max: 2, // Limit each IP to 100 requests per windowMs
  message: "Too many requests,2 req/minute allowed",
});

app.use(limiter);

app.listen(process.env.PORT ? process.env.PORT : 3000, function () {
  console.log(
    `Server is running on port ${process.env.PORT ? process.env.PORT : 3000}`
  );
});

