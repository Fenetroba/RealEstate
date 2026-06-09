// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PropertyRegistry
 * @notice Stores land title registrations with duplicate prevention.
 *
 * Every approved property gets an on-chain record keyed by its
 * government-issued land title number. Duplicate title numbers are
 * rejected at the contract level, making fraud detectable on-chain.
 *
 * Roles:
 *   DEFAULT_ADMIN_ROLE  — can grant / revoke roles
 *   REGISTRAR_ROLE      — can register, update, and revoke properties
 */
contract PropertyRegistry is AccessControl {

    // ─── Roles ────────────────────────────────────────────────────────────────
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    // ─── Structs ──────────────────────────────────────────────────────────────

    enum VerificationStatus { PENDING, VERIFIED, REVOKED }

    struct RegistryEntry {
        uint256 propertyId;       // internal registry ID (1-based)
        string  titleNumber;      // government-issued land title number
        uint256 nftTokenId;       // ERC-721 token ID (0 = not minted yet)
        address ownerWallet;      // current owner wallet
        bytes32 metadataHash;     // SHA-256 of the approved metadata JSON
        VerificationStatus status;
        uint256 registeredAt;     // block timestamp
        uint256 updatedAt;        // block timestamp of last update
    }

    // ─── State ────────────────────────────────────────────────────────────────

    uint256 private _counter;

    // titleNumber (uppercase) → propertyId
    mapping(string => uint256) private _titleToId;

    // propertyId → RegistryEntry
    mapping(uint256 => RegistryEntry) private _entries;

    // nftTokenId → propertyId  (0 = not linked)
    mapping(uint256 => uint256) private _nftToProperty;

    // ─── Events ───────────────────────────────────────────────────────────────

    event PropertyRegistered(
        uint256 indexed propertyId,
        string  indexed titleNumber,
        address indexed ownerWallet,
        uint256 nftTokenId,
        bytes32 metadataHash
    );

    event PropertyUpdated(
        uint256 indexed propertyId,
        address indexed ownerWallet,
        uint256 nftTokenId,
        bytes32 metadataHash
    );

    event PropertyRevoked(
        uint256 indexed propertyId,
        string  indexed titleNumber,
        address revokedBy
    );

    event OwnershipTransferred(
        uint256 indexed propertyId,
        address indexed previousOwner,
        address indexed newOwner
    );

    // ─── Errors ───────────────────────────────────────────────────────────────

    error DuplicateTitleNumber(string titleNumber, uint256 existingPropertyId);
    error PropertyNotFound(uint256 propertyId);
    error TitleNumberRequired();
    error AlreadyRevoked(uint256 propertyId);

    // ─── Constructor ─────────────────────────────────────────────────────────

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(REGISTRAR_ROLE, admin);
    }

    // ─── External: Write ─────────────────────────────────────────────────────

    /**
     * @notice Register a new property.
     * @dev Reverts with DuplicateTitleNumber if titleNumber already exists
     *      (even if the previous entry was PENDING or VERIFIED).
     *      Only REVOKED entries free up the title number.
     * @param titleNumber  Normalised (uppercase, trimmed) title number.
     * @param nftTokenId   0 if the NFT has not been minted yet.
     * @param ownerWallet  Current owner address.
     * @param metadataHash SHA-256 of the approved metadata JSON.
     * @return propertyId  Newly assigned registry ID.
     */
    function registerProperty(
        string  calldata titleNumber,
        uint256 nftTokenId,
        address ownerWallet,
        bytes32 metadataHash
    )
        external
        onlyRole(REGISTRAR_ROLE)
        returns (uint256 propertyId)
    {
        if (bytes(titleNumber).length == 0) revert TitleNumberRequired();

        uint256 existing = _titleToId[titleNumber];
        if (existing != 0 && _entries[existing].status != VerificationStatus.REVOKED) {
            revert DuplicateTitleNumber(titleNumber, existing);
        }

        unchecked { ++_counter; }
        propertyId = _counter;

        _titleToId[titleNumber] = propertyId;

        _entries[propertyId] = RegistryEntry({
            propertyId:   propertyId,
            titleNumber:  titleNumber,
            nftTokenId:   nftTokenId,
            ownerWallet:  ownerWallet,
            metadataHash: metadataHash,
            status:       VerificationStatus.VERIFIED,
            registeredAt: block.timestamp,
            updatedAt:    block.timestamp
        });

        if (nftTokenId != 0) {
            _nftToProperty[nftTokenId] = propertyId;
        }

        emit PropertyRegistered(propertyId, titleNumber, ownerWallet, nftTokenId, metadataHash);
    }

    /**
     * @notice Update an existing registry entry (new metadata or NFT token).
     */
    function updateProperty(
        uint256 propertyId,
        uint256 nftTokenId,
        address ownerWallet,
        bytes32 metadataHash
    )
        external
        onlyRole(REGISTRAR_ROLE)
    {
        RegistryEntry storage entry = _entries[propertyId];
        if (entry.propertyId == 0) revert PropertyNotFound(propertyId);
        if (entry.status == VerificationStatus.REVOKED) revert AlreadyRevoked(propertyId);

        // Unlink old NFT mapping if token changed
        if (entry.nftTokenId != 0 && entry.nftTokenId != nftTokenId) {
            delete _nftToProperty[entry.nftTokenId];
        }

        entry.nftTokenId   = nftTokenId;
        entry.ownerWallet  = ownerWallet;
        entry.metadataHash = metadataHash;
        entry.updatedAt    = block.timestamp;

        if (nftTokenId != 0) {
            _nftToProperty[nftTokenId] = propertyId;
        }

        emit PropertyUpdated(propertyId, ownerWallet, nftTokenId, metadataHash);
    }

    /**
     * @notice Transfer ownership of a registered property.
     */
    function transferOwnership(uint256 propertyId, address newOwner)
        external
        onlyRole(REGISTRAR_ROLE)
    {
        RegistryEntry storage entry = _entries[propertyId];
        if (entry.propertyId == 0) revert PropertyNotFound(propertyId);
        if (entry.status == VerificationStatus.REVOKED) revert AlreadyRevoked(propertyId);

        address prev = entry.ownerWallet;
        entry.ownerWallet = newOwner;
        entry.updatedAt   = block.timestamp;

        emit OwnershipTransferred(propertyId, prev, newOwner);
    }

    /**
     * @notice Revoke a registration (e.g. fraud detected).
     *         Frees the title number for future legitimate registration.
     */
    function revokeProperty(uint256 propertyId)
        external
        onlyRole(REGISTRAR_ROLE)
    {
        RegistryEntry storage entry = _entries[propertyId];
        if (entry.propertyId == 0) revert PropertyNotFound(propertyId);
        if (entry.status == VerificationStatus.REVOKED) revert AlreadyRevoked(propertyId);

        entry.status    = VerificationStatus.REVOKED;
        entry.updatedAt = block.timestamp;

        // Free the title number so a legitimate re-registration is possible
        delete _titleToId[entry.titleNumber];

        emit PropertyRevoked(propertyId, entry.titleNumber, msg.sender);
    }

    // ─── External: Read ──────────────────────────────────────────────────────

    /**
     * @notice Look up a registry entry by property ID.
     */
    function getProperty(uint256 propertyId)
        external
        view
        returns (RegistryEntry memory)
    {
        if (_entries[propertyId].propertyId == 0) revert PropertyNotFound(propertyId);
        return _entries[propertyId];
    }

    /**
     * @notice Look up a registry entry by land title number.
     * @return entry  The entry, or reverts if not found / revoked.
     */
    function getPropertyByTitle(string calldata titleNumber)
        external
        view
        returns (RegistryEntry memory)
    {
        uint256 id = _titleToId[titleNumber];
        if (id == 0) revert PropertyNotFound(0);
        return _entries[id];
    }

    /**
     * @notice Returns true if a title number is already registered (and not revoked).
     */
    function isTitleRegistered(string calldata titleNumber)
        external
        view
        returns (bool)
    {
        uint256 id = _titleToId[titleNumber];
        return id != 0 && _entries[id].status != VerificationStatus.REVOKED;
    }

    /**
     * @notice Look up a property by its NFT token ID.
     */
    function getPropertyByNft(uint256 nftTokenId)
        external
        view
        returns (RegistryEntry memory)
    {
        uint256 id = _nftToProperty[nftTokenId];
        if (id == 0) revert PropertyNotFound(nftTokenId);
        return _entries[id];
    }

    /**
     * @notice Total number of registered properties (including revoked).
     */
    function totalRegistered() external view returns (uint256) {
        return _counter;
    }
}
