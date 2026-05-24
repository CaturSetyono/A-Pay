import { ethers } from "ethers";

export const AGENTPAY_ESCROW_ABI = [
  "function createEscrow(bytes32 escrowId, address receiver, address token, uint256 amount, uint256 lockDuration) external payable",
  "function releaseEscrow(bytes32 escrowId) external",
  "function cancelEscrow(bytes32 escrowId) external",
  "function escrows(bytes32) external view returns (address payer, address receiver, address token, uint256 amount, uint256 releaseTimeout, uint8 status)",
  "event EscrowCreated(bytes32 indexed escrowId, address indexed payer, address indexed receiver, address token, uint256 amount, uint256 releaseTimeout)",
  "event EscrowReleased(bytes32 indexed escrowId)",
  "event EscrowCancelled(bytes32 indexed escrowId)"
];

export const ERC20_ABI = [
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

export interface AgentPayConfig {
  contractAddress: string;
  signerOrProvider: ethers.Signer | ethers.Provider;
}

export interface CreateEscrowParams {
  escrowId?: string;
  payer?: string; // Added to match PRD spec
  receiver: string;
  amount: string; // format matches unit (e.g. "1.5" for ETH/tokens)
  token: string;  // Use ethers.ZeroAddress for native token
  lockDuration?: number; // lock duration in seconds, default is 24 hours (86400)
}

export interface CreateEscrowResult {
  escrowId: string;
  status: "locked";
  txHash: string;
}

export interface ReleaseEscrowParams {
  escrowId: string;
}

export interface ReleaseEscrowResult {
  status: "released";
  txHash: string;
}

export interface CancelEscrowParams {
  escrowId: string;
}

export interface CancelEscrowResult {
  status: "cancelled";
  txHash: string;
}

export interface VerifyTxParams {
  txHash: string;
}

export interface VerifyTxResult {
  confirmed: boolean;
  blockNumber: number;
}

export class AgentPay {
  private contract: ethers.Contract;
  private signerOrProvider: ethers.Signer | ethers.Provider;

  constructor(config: AgentPayConfig) {
    if (!config.contractAddress) {
      throw new Error("Contract address is required.");
    }
    this.signerOrProvider = config.signerOrProvider;
    this.contract = new ethers.Contract(
      config.contractAddress,
      AGENTPAY_ESCROW_ABI,
      this.signerOrProvider
    );
  }

  private getSigner(): ethers.Signer {
    if ("signTransaction" in this.signerOrProvider || "sendTransaction" in this.signerOrProvider) {
      return this.signerOrProvider as ethers.Signer;
    }
    throw new Error("A Signer is required for this operation (Provider is read-only).");
  }

  private async getParsedAmount(amount: string, tokenAddress: string): Promise<bigint> {
    if (tokenAddress === ethers.ZeroAddress) {
      return ethers.parseEther(amount);
    } else {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signerOrProvider);
      try {
        const decimals = await tokenContract.decimals();
        return ethers.parseUnits(amount, decimals);
      } catch (err) {
        return ethers.parseUnits(amount, 18); // Fallback
      }
    }
  }

  /**
   * Lock funds inside escrow.
   */
  async createEscrow(params: CreateEscrowParams): Promise<CreateEscrowResult> {
    const signer = this.getSigner();
    // Auto-generate bytes32 id if not provided
    const escrowId = params.escrowId || ethers.hexlify(ethers.randomBytes(32));
    const token = params.token || ethers.ZeroAddress;
    const lockDuration = params.lockDuration !== undefined ? params.lockDuration : 86400;

    const parsedAmount = await this.getParsedAmount(params.amount, token);

    if (token !== ethers.ZeroAddress) {
      const tokenContract = new ethers.Contract(token, ERC20_ABI, signer);
      const payerAddress = await signer.getAddress();
      const contractAddress = await this.contract.getAddress();
      const allowance: bigint = await tokenContract.allowance(payerAddress, contractAddress);

      if (allowance < parsedAmount) {
        const approveTx = await tokenContract.approve(contractAddress, parsedAmount);
        await approveTx.wait();
      }
    }

    const valueToSend = token === ethers.ZeroAddress ? parsedAmount : 0n;

    const tx = await this.contract.createEscrow(
      escrowId,
      params.receiver,
      token,
      parsedAmount,
      lockDuration,
      { value: valueToSend }
    );

    const receipt = await tx.wait();

    return {
      escrowId,
      status: "locked",
      txHash: receipt ? receipt.hash : tx.hash
    };
  }

  /**
   * Release funds to receiver.
   */
  async releaseEscrow(params: ReleaseEscrowParams): Promise<ReleaseEscrowResult> {
    const signer = this.getSigner();
    const tx = await this.contract.releaseEscrow(params.escrowId);
    const receipt = await tx.wait();

    return {
      status: "released",
      txHash: receipt ? receipt.hash : tx.hash
    };
  }

  /**
   * Cancel escrow.
   */
  async cancelEscrow(params: CancelEscrowParams): Promise<CancelEscrowResult> {
    const signer = this.getSigner();
    const tx = await this.contract.cancelEscrow(params.escrowId);
    const receipt = await tx.wait();

    return {
      status: "cancelled",
      txHash: receipt ? receipt.hash : tx.hash
    };
  }

  /**
   * Verify transaction confirmation status.
   */
  async verifyTransaction(params: VerifyTxParams): Promise<VerifyTxResult> {
    let provider: ethers.Provider;
    if ("sendTransaction" in this.signerOrProvider) {
      const signer = this.signerOrProvider as ethers.Signer;
      if (!signer.provider) {
        throw new Error("Provider not associated with signer.");
      }
      provider = signer.provider;
    } else {
      provider = this.signerOrProvider as ethers.Provider;
    }

    const receipt = await provider.getTransactionReceipt(params.txHash);
    if (!receipt) {
      return {
        confirmed: false,
        blockNumber: 0
      };
    }

    return {
      confirmed: receipt.status === 1,
      blockNumber: receipt.blockNumber
    };
  }

  /**
   * Fetch escrow details from the smart contract.
   */
  async getEscrow(escrowId: string) {
    const data = await this.contract.escrows(escrowId);
    const statuses = ["None", "Locked", "Released", "Cancelled"];
    return {
      payer: data[0],
      receiver: data[1],
      token: data[2],
      amount: data[3].toString(),
      releaseTimeout: Number(data[4]),
      status: statuses[Number(data[5])]
    };
  }
}
