// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentPayEscrow
 * @dev A smart contract facilitating secure escrow agreements between AI agents on Pharos.
 */
contract AgentPayEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum EscrowStatus { None, Locked, Released, Cancelled }

    struct Escrow {
        address payer;
        address receiver;
        address token; // address(0) for native token, otherwise ERC20 address
        uint256 amount;
        uint256 releaseTimeout; // block timestamp after which payer can cancel
        EscrowStatus status;
    }

    mapping(bytes32 => Escrow) public escrows;

    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed payer,
        address indexed receiver,
        address token,
        uint256 amount,
        uint256 releaseTimeout
    );
    event EscrowReleased(bytes32 indexed escrowId);
    event EscrowCancelled(bytes32 indexed escrowId);

    error EscrowAlreadyExists(bytes32 escrowId);
    error EscrowDoesNotExist(bytes32 escrowId);
    error EscrowNotLocked(bytes32 escrowId);
    error Unauthorized(address sender);
    error TimeoutNotReached();
    error InvalidAmount();
    error TransferFailed();

    /**
     * @notice Create a new escrow agreement.
     * @param escrowId Unique identifier for the escrow.
     * @param receiver The address that will receive the funds upon release.
     * @param token Address of the ERC20 token, or address(0) for native currency.
     * @param amount Amount of tokens (or native value) to lock.
     * @param lockDuration Time in seconds before the payer can cancel.
     */
    function createEscrow(
        bytes32 escrowId,
        address receiver,
        address token,
        uint256 amount,
        uint256 lockDuration
    ) external payable nonReentrant {
        if (escrows[escrowId].status != EscrowStatus.None) {
            revert EscrowAlreadyExists(escrowId);
        }
        if (amount == 0) {
            revert InvalidAmount();
        }
        if (receiver == address(0)) {
            revert Unauthorized(address(0));
        }

        if (token == address(0)) {
            if (msg.value != amount) {
                revert InvalidAmount();
            }
        } else {
            if (msg.value != 0) {
                revert InvalidAmount();
            }
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        escrows[escrowId] = Escrow({
            payer: msg.sender,
            receiver: receiver,
            token: token,
            amount: amount,
            releaseTimeout: block.timestamp + lockDuration,
            status: EscrowStatus.Locked
        });

        emit EscrowCreated(escrowId, msg.sender, receiver, token, amount, block.timestamp + lockDuration);
    }

    /**
     * @notice Release the escrowed funds to the receiver.
     * @param escrowId The unique identifier of the escrow.
     */
    function releaseEscrow(bytes32 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.status != EscrowStatus.Locked) {
            revert EscrowNotLocked(escrowId);
        }
        if (msg.sender != escrow.payer) {
            revert Unauthorized(msg.sender);
        }

        escrow.status = EscrowStatus.Released;

        if (escrow.token == address(0)) {
            (bool success, ) = escrow.receiver.call{value: escrow.amount}("");
            if (!success) {
                revert TransferFailed();
            }
        } else {
            IERC20(escrow.token).safeTransfer(escrow.receiver, escrow.amount);
        }

        emit EscrowReleased(escrowId);
    }

    /**
     * @notice Cancel the escrow agreement.
     * @dev Payer can cancel after releaseTimeout. Receiver can cancel at any time to refund payer.
     * @param escrowId The unique identifier of the escrow.
     */
    function cancelEscrow(bytes32 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        if (escrow.status != EscrowStatus.Locked) {
            revert EscrowNotLocked(escrowId);
        }

        if (msg.sender == escrow.payer) {
            if (block.timestamp < escrow.releaseTimeout) {
                revert TimeoutNotReached();
            }
        } else if (msg.sender == escrow.receiver) {
            // Receiver can refund at any time
        } else {
            revert Unauthorized(msg.sender);
        }

        escrow.status = EscrowStatus.Cancelled;

        if (escrow.token == address(0)) {
            (bool success, ) = escrow.payer.call{value: escrow.amount}("");
            if (!success) {
                revert TransferFailed();
            }
        } else {
            IERC20(escrow.token).safeTransfer(escrow.payer, escrow.amount);
        }

        emit EscrowCancelled(escrowId);
    }
}
