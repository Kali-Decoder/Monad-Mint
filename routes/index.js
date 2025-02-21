const express = require("express");
const router = express.Router();
const { NFT_ADDRESS, NFT_ABI } = require("../constant");
const ethers = require("ethers");


/**
 * @swagger
 * /mint-monad-nft:
 *   get:
 *     summary: Mint a Monad NFT
 *     description: This endpoint mints an NFT to the specified receiver address if they do not already own one.
 *     tags:
 *       - Mint your GMonad NFT 
 *     parameters:
 *       - in: query
 *         name: receiverAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: The wallet address of the receiver who will get the NFT.
 *     responses:
 *       200:
 *         description: NFT minted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "NFT minted successfully"
 *                 tokenId:
 *                   type: string
 *                   example: "1"
 *                 transaction:
 *                   type: string
 *                   example: "https://testnet.monadexplorer.com/tx/0x123456789abcdef"
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Receiver address is required"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred while minting the NFT"
 */
router.get("/mint-monad-nft", async (req, res) => {
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
      transaction: `https://testnet.monadexplorer.com/tx/
        // ${tx.hash}`,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
