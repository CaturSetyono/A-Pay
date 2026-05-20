import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { AgentPayEscrow, MockERC20 } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("AgentPayEscrow", function () {
  let escrow: AgentPayEscrow;
  let mockToken: MockERC20;
  let owner: SignerWithAddress;
  let payer: SignerWithAddress;
  let receiver: SignerWithAddress;
  let other: SignerWithAddress;

  const ONE_DAY = 24 * 60 * 60;
  const ESCROW_ID = ethers.encodeBytes32String("test-escrow-1");
  const AMOUNT = ethers.parseEther("1.0");

  beforeEach(async function () {
    [owner, payer, receiver, other] = await ethers.getSigners() as any;

    const AgentPayEscrowFactory = await ethers.getContractFactory("AgentPayEscrow");
    escrow = await AgentPayEscrowFactory.deploy() as any;

    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20Factory.deploy("Mock Token", "MTK", ethers.parseEther("1000")) as any;
    
    // Transfer some tokens to payer
    await mockToken.transfer(payer.address, ethers.parseEther("100"));
  });

  describe("Native Escrow", function () {
    it("should create a native token escrow", async function () {
      await expect(
        escrow.connect(payer).createEscrow(
          ESCROW_ID,
          receiver.address,
          ethers.ZeroAddress,
          AMOUNT,
          ONE_DAY,
          { value: AMOUNT }
        )
      )
        .to.emit(escrow, "EscrowCreated");

      const escrowData = await escrow.escrows(ESCROW_ID);
      expect(escrowData.payer).to.equal(payer.address);
      expect(escrowData.receiver).to.equal(receiver.address);
      expect(escrowData.token).to.equal(ethers.ZeroAddress);
      expect(escrowData.amount).to.equal(AMOUNT);
      expect(escrowData.status).to.equal(1); // Locked
    });

    it("should release native token escrow to receiver", async function () {
      await escrow.connect(payer).createEscrow(
        ESCROW_ID,
        receiver.address,
        ethers.ZeroAddress,
        AMOUNT,
        ONE_DAY,
        { value: AMOUNT }
      );

      const initialBalance = await ethers.provider.getBalance(receiver.address);

      await expect(escrow.connect(payer).releaseEscrow(ESCROW_ID))
        .to.emit(escrow, "EscrowReleased")
        .withArgs(ESCROW_ID);

      const finalBalance = await ethers.provider.getBalance(receiver.address);
      expect(finalBalance - initialBalance).to.equal(AMOUNT);

      const escrowData = await escrow.escrows(ESCROW_ID);
      expect(escrowData.status).to.equal(2); // Released
    });

    it("should allow receiver to cancel escrow at any time (refund to payer)", async function () {
      await escrow.connect(payer).createEscrow(
        ESCROW_ID,
        receiver.address,
        ethers.ZeroAddress,
        AMOUNT,
        ONE_DAY,
        { value: AMOUNT }
      );

      const initialBalance = await ethers.provider.getBalance(payer.address);

      await expect(escrow.connect(receiver).cancelEscrow(ESCROW_ID))
        .to.emit(escrow, "EscrowCancelled")
        .withArgs(ESCROW_ID);

      const finalBalance = await ethers.provider.getBalance(payer.address);
      expect(finalBalance - initialBalance).to.equal(AMOUNT);

      const escrowData = await escrow.escrows(ESCROW_ID);
      expect(escrowData.status).to.equal(3); // Cancelled
    });

    it("should not allow payer to cancel escrow before timeout", async function () {
      await escrow.connect(payer).createEscrow(
        ESCROW_ID,
        receiver.address,
        ethers.ZeroAddress,
        AMOUNT,
        ONE_DAY,
        { value: AMOUNT }
      );

      await expect(escrow.connect(payer).cancelEscrow(ESCROW_ID)).to.be.revertedWithCustomError(
        escrow,
        "TimeoutNotReached"
      );
    });

    it("should allow payer to cancel escrow after timeout", async function () {
      await escrow.connect(payer).createEscrow(
        ESCROW_ID,
        receiver.address,
        ethers.ZeroAddress,
        AMOUNT,
        ONE_DAY,
        { value: AMOUNT }
      );

      await time.increase(ONE_DAY + 1);

      const initialBalance = await ethers.provider.getBalance(payer.address);
      
      const tx = await escrow.connect(payer).cancelEscrow(ESCROW_ID);
      const receipt = await tx.wait();
      const gasUsed = receipt ? BigInt(receipt.gasUsed) * BigInt(receipt.gasPrice) : 0n;

      const finalBalance = await ethers.provider.getBalance(payer.address);
      expect(finalBalance).to.equal(initialBalance + AMOUNT - gasUsed);

      const escrowData = await escrow.escrows(ESCROW_ID);
      expect(escrowData.status).to.equal(3); // Cancelled
    });
  });

  describe("ERC20 Escrow", function () {
    beforeEach(async function () {
      await mockToken.connect(payer).approve(await escrow.getAddress(), AMOUNT);
    });

    it("should create an ERC20 escrow", async function () {
      const tokenAddress = await mockToken.getAddress();
      await expect(
        escrow.connect(payer).createEscrow(
          ESCROW_ID,
          receiver.address,
          tokenAddress,
          AMOUNT,
          ONE_DAY
        )
      )
        .to.emit(escrow, "EscrowCreated");

      const escrowData = await escrow.escrows(ESCROW_ID);
      expect(escrowData.payer).to.equal(payer.address);
      expect(escrowData.receiver).to.equal(receiver.address);
      expect(escrowData.token).to.equal(tokenAddress);
      expect(escrowData.amount).to.equal(AMOUNT);
      expect(escrowData.status).to.equal(1); // Locked
    });

    it("should release ERC20 escrow to receiver", async function () {
      const tokenAddress = await mockToken.getAddress();
      await escrow.connect(payer).createEscrow(
        ESCROW_ID,
        receiver.address,
        tokenAddress,
        AMOUNT,
        ONE_DAY
      );

      const initialBalance = await mockToken.balanceOf(receiver.address);

      await expect(escrow.connect(payer).releaseEscrow(ESCROW_ID))
        .to.emit(escrow, "EscrowReleased")
        .withArgs(ESCROW_ID);

      const finalBalance = await mockToken.balanceOf(receiver.address);
      expect(finalBalance - initialBalance).to.equal(AMOUNT);
    });

    it("should allow receiver to cancel ERC20 escrow", async function () {
      const tokenAddress = await mockToken.getAddress();
      await escrow.connect(payer).createEscrow(
        ESCROW_ID,
        receiver.address,
        tokenAddress,
        AMOUNT,
        ONE_DAY
      );

      const initialBalance = await mockToken.balanceOf(payer.address);

      await expect(escrow.connect(receiver).cancelEscrow(ESCROW_ID))
        .to.emit(escrow, "EscrowCancelled")
        .withArgs(ESCROW_ID);

      const finalBalance = await mockToken.balanceOf(payer.address);
      expect(finalBalance - initialBalance).to.equal(AMOUNT);
    });
  });
});
