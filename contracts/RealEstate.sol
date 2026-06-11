// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RealEstate
 * @notice ERC-721 property registry + marketplace.
 *         Admin approves property requests → mints NFT to requester.
 *         Owners can list for sale or rent; buyers/renters pay on-chain.
 */
contract RealEstate is ERC721, AccessControl {

    // ─── Roles ────────────────────────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ─── Counters ─────────────────────────────────────────────────────────────
    uint256 private _propertyIdCounter;
    uint256 private _requestIdCounter;
    uint256 private _updateRequestIdCounter;

    // ─── Transfer guard ───────────────────────────────────────────────────────
    // Set to true around internal _transfer calls inside buyProperty/rentProperty
    // so _update knows the transfer is platform-initiated.
    bool private _platformTransferring;

    mapping(uint256 => bool)    public isForRent;
    mapping(uint256 => uint256) public rentPrice;     // monthly rent in wei
    mapping(uint256 => address) public currentTenant;

    // ─── Commission & fees ────────────────────────────────────────────────────
    uint256 public commissionPercent = 2;
    uint256 public registrationFee   = 0.07 ether;
    address public governmentWallet;

    // ─── Structs ──────────────────────────────────────────────────────────────

    struct PropertyDetails {
        string  name;
        string  location;
        string  propertyType;
        uint256 price;           // stored in wei after submitRequest
        bool    isForSale;
        bytes32 metadataHash;
        bytes32 imagesRootHash;
        bytes32 documentsRootHash;
        uint256 bedrooms;
        uint256 bathrooms;
        uint256 sqft;
        uint256 parking;
        uint256 floors;
        uint256 yearBuilt;
    }

    struct Property {
        uint256       id;
        address       owner;
        PropertyDetails details;
    }

    struct PropertyRequest {
        uint256         id;
        address         requester;
        PropertyDetails details;
        RequestStatus   status;
        string          declineReason;
    }

    struct OwnershipRecord {
        address from;
        address to;
        uint256 price;
        uint256 timestamp;
    }

    struct UpdateRequest {
        uint256      id;
        uint256      propertyId;
        address      requester;
        bytes32      newMetadataHash;
        bytes32      newImagesRootHash;
        bytes32      newDocumentsRootHash;
        UpdateStatus status;
        string       declineReason;
        uint256      timestamp;
    }

    struct MetadataVersion {
        bytes32 metadataHash;
        bytes32 imagesRootHash;
        bytes32 documentsRootHash;
        uint256 timestamp;
        uint256 versionNo;
    }

    // ─── Enums ────────────────────────────────────────────────────────────────
    enum RequestStatus { Pending, Approved, Declined }
    enum UpdateStatus  { Pending, Approved, Declined }

    // ─── Mappings ─────────────────────────────────────────────────────────────
    mapping(uint256 => Property)          public properties;
    mapping(uint256 => PropertyRequest)   public requests;
    mapping(uint256 => OwnershipRecord[]) public ownershipHistory;
    mapping(uint256 => MetadataVersion[]) public metadataVersions;
    mapping(uint256 => UpdateRequest[])   public updateRequests;

    // ─── Events ───────────────────────────────────────────────────────────────
    event RequestSubmitted(uint256 indexed requestId, address requester, string name);
    event RequestApproved(uint256 indexed requestId, uint256 propertyId);
    event RequestDeclined(uint256 indexed requestId, string reason);
    event PropertyListed(uint256 indexed propertyId, uint256 price);
    event PropertySold(uint256 indexed propertyId, address from, address to, uint256 price);
    event PropertyListedForRent(uint256 indexed propertyId, uint256 rentPriceWei);
    event PropertyRented(uint256 indexed propertyId, address tenant, uint256 rentPaid);
    event MetadataUpdated(uint256 indexed propertyId, uint256 versionNo, bytes32 metadataHash);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(address _governmentWallet) ERC721("RealEstateNFT", "RENFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        governmentWallet = _governmentWallet;
    }

    // ─── Citizen: submit a property registration request ─────────────────────

    /**
     * @notice Submit a property registration request.
     *         Caller pays `registrationFee`; fee is forwarded to the government wallet.
     * @param details  Property metadata. `price` is supplied in whole ETH; the contract
     *                 converts it to wei.
     */
    function submitRequest(PropertyDetails memory details) public payable {
        require(msg.value >= registrationFee, "Insufficient registration fee");

        // Forward fee to government wallet
        if (governmentWallet != address(0)) {
            (bool ok,) = payable(governmentWallet).call{value: msg.value}("");
            require(ok, "Fee transfer failed");
        }

        // Convert price from whole ETH to wei
        details.price = details.price * 1 ether;

        uint256 requestId = _requestIdCounter++;
        requests[requestId] = PropertyRequest({
            id:           requestId,
            requester:    msg.sender,
            details:      details,
            status:       RequestStatus.Pending,
            declineReason: ""
        });

        emit RequestSubmitted(requestId, msg.sender, details.name);
    }

    // ─── Citizen: list / buy / rent ───────────────────────────────────────────

    /**
     * @notice List an owned NFT for sale.
     * @param propertyId    NFT token id.
     * @param priceInEther  Sale price in whole ETH (stored as wei internally).
     */
    function listProperty(uint256 propertyId, uint256 priceInEther) public {
        require(ownerOf(propertyId) == msg.sender, "Not owner");
        require(priceInEther > 0, "Price must be > 0");
        properties[propertyId].details.isForSale = true;
        properties[propertyId].details.price     = priceInEther * 1 ether;
        emit PropertyListed(propertyId, priceInEther * 1 ether);
    }

    /**
     * @notice Buy a listed property. Sends ETH to seller (minus commission to gov).
     */
    function buyProperty(uint256 propertyId) public payable {
        Property storage prop = properties[propertyId];
        address seller = ownerOf(propertyId);

        require(prop.details.isForSale,   "Not for sale");
        require(msg.sender != seller,      "Already owner");
        require(msg.value >= prop.details.price, "Insufficient ETH");

        uint256 commission   = (msg.value * commissionPercent) / 100;
        uint256 sellerAmount = msg.value - commission;

        // Transfer NFT — flag guards the _update override
        _platformTransferring = true;
        _transfer(seller, msg.sender, propertyId);
        _platformTransferring = false;

        // Pay parties
        (bool okSeller,) = payable(seller).call{value: sellerAmount}("");
        require(okSeller, "Seller payment failed");
        if (commission > 0 && governmentWallet != address(0)) {
            (bool okGov,) = payable(governmentWallet).call{value: commission}("");
            require(okGov, "Gov payment failed");
        }

        ownershipHistory[propertyId].push(OwnershipRecord({
            from:      seller,
            to:        msg.sender,
            price:     msg.value,
            timestamp: block.timestamp
        }));

        prop.details.isForSale = false;
        prop.owner             = msg.sender;

        emit PropertySold(propertyId, seller, msg.sender, msg.value);
    }

    /**
     * @notice List an owned property for rent.
     * @param propertyId       NFT token id.
     * @param rentPriceInEther Monthly rent in whole ETH.
     */
    function listForRent(uint256 propertyId, uint256 rentPriceInEther) public {
        require(ownerOf(propertyId) == msg.sender, "Not owner");
        require(rentPriceInEther > 0, "Rent must be > 0");
        isForRent[propertyId] = true;
        rentPrice[propertyId] = rentPriceInEther * 1 ether;
        emit PropertyListedForRent(propertyId, rentPriceInEther * 1 ether);
    }

    /**
     * @notice Rent a listed property. Pays owner (minus commission to gov).
     */
    function rentProperty(uint256 propertyId) public payable {
        require(isForRent[propertyId], "Not for rent");
        address owner = ownerOf(propertyId);
        require(msg.sender != owner, "Already owner");
        require(msg.value >= rentPrice[propertyId], "Insufficient ETH");

        uint256 commission  = (msg.value * commissionPercent) / 100;
        uint256 ownerAmount = msg.value - commission;

        (bool okOwner,) = payable(owner).call{value: ownerAmount}("");
        require(okOwner, "Owner payment failed");
        if (commission > 0 && governmentWallet != address(0)) {
            (bool okGov,) = payable(governmentWallet).call{value: commission}("");
            require(okGov, "Gov payment failed");
        }

        currentTenant[propertyId] = msg.sender;
        emit PropertyRented(propertyId, msg.sender, msg.value);
    }

    // ─── Admin: approve / decline ─────────────────────────────────────────────

    /**
     * @notice Approve a pending property request → mints the NFT to the requester.
     */
    function approveRequest(uint256 requestId) public onlyRole(ADMIN_ROLE) {
        PropertyRequest storage req = requests[requestId];
        require(req.status == RequestStatus.Pending, "Not pending");

        req.status = RequestStatus.Approved;

        uint256 propertyId = _propertyIdCounter++;

        // Mint NFT — _update is called internally; no self-call needed
        _mint(req.requester, propertyId);

        properties[propertyId] = Property({
            id:      propertyId,
            owner:   req.requester,
            details: req.details
        });

        ownershipHistory[propertyId].push(OwnershipRecord({
            from:      address(0),
            to:        req.requester,
            price:     0,
            timestamp: block.timestamp
        }));

        metadataVersions[propertyId].push(MetadataVersion({
            metadataHash:      req.details.metadataHash,
            imagesRootHash:    req.details.imagesRootHash,
            documentsRootHash: req.details.documentsRootHash,
            timestamp:         block.timestamp,
            versionNo:         1
        }));

        emit RequestApproved(requestId, propertyId);
    }

    function declineRequest(uint256 requestId, string memory reason) public onlyRole(ADMIN_ROLE) {
        PropertyRequest storage req = requests[requestId];
        require(req.status == RequestStatus.Pending, "Not pending");
        req.status = RequestStatus.Declined;
        req.declineReason = reason;
        emit RequestDeclined(requestId, reason);
    }

    // ─── Admin: settings ──────────────────────────────────────────────────────

    function addAdmin(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ADMIN_ROLE, account);
    }

    function setCommission(uint256 percent) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(percent <= 10, "Commission too high");
        commissionPercent = percent;
    }

    function setRegistrationFee(uint256 feeInWei) public onlyRole(DEFAULT_ADMIN_ROLE) {
        registrationFee = feeInWei;
    }

    // ─── Update requests ──────────────────────────────────────────────────────

    function submitUpdateRequest(
        uint256 propertyId,
        bytes32 newMetadataHash,
        bytes32 newImagesRootHash,
        bytes32 newDocumentsRootHash
    ) public {
        require(ownerOf(propertyId) == msg.sender, "Not owner");
        uint256 updateId = _updateRequestIdCounter++;
        updateRequests[propertyId].push(UpdateRequest({
            id:                   updateId,
            propertyId:           propertyId,
            requester:            msg.sender,
            newMetadataHash:      newMetadataHash,
            newImagesRootHash:    newImagesRootHash,
            newDocumentsRootHash: newDocumentsRootHash,
            status:               UpdateStatus.Pending,
            declineReason:        "",
            timestamp:            block.timestamp
        }));
    }

    function approveUpdateRequest(uint256 propertyId, uint256 updateIndex)
        public onlyRole(ADMIN_ROLE)
    {
        UpdateRequest storage req = updateRequests[propertyId][updateIndex];
        require(req.status == UpdateStatus.Pending, "Not pending");
        req.status = UpdateStatus.Approved;

        uint256 newVersionNo = metadataVersions[propertyId].length + 1;
        metadataVersions[propertyId].push(MetadataVersion({
            metadataHash:      req.newMetadataHash,
            imagesRootHash:    req.newImagesRootHash,
            documentsRootHash: req.newDocumentsRootHash,
            timestamp:         block.timestamp,
            versionNo:         newVersionNo
        }));

        properties[propertyId].details.metadataHash      = req.newMetadataHash;
        properties[propertyId].details.imagesRootHash    = req.newImagesRootHash;
        properties[propertyId].details.documentsRootHash = req.newDocumentsRootHash;

        emit MetadataUpdated(propertyId, newVersionNo, req.newMetadataHash);
    }

    function declineUpdateRequest(uint256 propertyId, uint256 updateIndex, string memory reason)
        public onlyRole(ADMIN_ROLE)
    {
        UpdateRequest storage req = updateRequests[propertyId][updateIndex];
        require(req.status == UpdateStatus.Pending, "Not pending");
        req.status = UpdateStatus.Declined;
        req.declineReason = reason;
    }

    // ─── View ─────────────────────────────────────────────────────────────────

    function getTotalProperties() public view returns (uint256) { return _propertyIdCounter; }
    function getTotalRequests()   public view returns (uint256) { return _requestIdCounter;  }

    function getOwnershipHistory(uint256 propertyId)
        public view returns (OwnershipRecord[] memory)
    {
        return ownershipHistory[propertyId];
    }

    function getUpdateRequests(uint256 propertyId)
        public view returns (UpdateRequest[] memory)
    {
        return updateRequests[propertyId];
    }

    function getMetadataVersions(uint256 propertyId)
        public view returns (MetadataVersion[] memory)
    {
        return metadataVersions[propertyId];
    }

    function getLatestHashes(uint256 propertyId)
        public view returns (
            bytes32 metadataHash,
            bytes32 imagesRootHash,
            bytes32 documentsRootHash
        )
    {
        PropertyDetails storage d = properties[propertyId].details;
        return (d.metadataHash, d.imagesRootHash, d.documentsRootHash);
    }

    function isAdmin(address account) public view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    // ─── ERC-721 transfer override ────────────────────────────────────────────
    // Block direct peer-to-peer transfers (safeTransferFrom / transferFrom).
    // Only allow: minting (from == 0), admin-initiated transfers, and
    // platform-initiated transfers flagged by _platformTransferring.

    function _update(address to, uint256 tokenId, address auth)
        internal override returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && !hasRole(ADMIN_ROLE, msg.sender) && !_platformTransferring) {
            revert("Use buyProperty or rentProperty");
        }
        return super._update(to, tokenId, auth);
    }

    // ─── Interface support ────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
