// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract RealEstate is ERC721, AccessControl {

    // ============ ROLES ============
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // ============ COUNTERS ============
    uint256 private _propertyIdCounter;
    uint256 private _requestIdCounter;
    uint256 private _updateRequestIdCounter;

    // ============ COMMISSION & FEES ============
    uint256 public commissionPercent = 2;
    uint256 public registrationFee = 0.07 ether;
    address public governmentWallet;
    bool public platformRestricted = true;

    // ============ STRUCTS ============

    struct PropertyDetails {
        string name;
        string location;
        string propertyType;
        uint256 price;
        bool isForSale;
        // ── CHANGED: replaced string ipfsHash with three bytes32 hash fields ──
        bytes32 metadataHash;      // SHA-256 of the property metadata JSON
        bytes32 imagesRootHash;    // Merkle root of all image hashes
        bytes32 documentsRootHash; // Merkle root of all document hashes
        // ─────────────────────────────────────────────────────────────────────
        uint256 bedrooms;
        uint256 bathrooms;
        uint256 sqft;
        uint256 parking;
        uint256 floors;
        uint256 yearBuilt;
    }

    struct Property {
        uint256 id;
        address owner;
        PropertyDetails details;
    }

    struct PropertyRequest {
        uint256 id;
        address requester;
        PropertyDetails details;
        RequestStatus status;
        string declineReason;
    }

    struct OwnershipRecord {
        address from;
        address to;
        uint256 price;
        uint256 timestamp;
    }

    // ── CHANGED: replaced string newIpfsHash with three bytes32 hash fields ──
    struct UpdateRequest {
        uint256 id;
        uint256 propertyId;
        address requester;
        bytes32 newMetadataHash;
        bytes32 newImagesRootHash;
        bytes32 newDocumentsRootHash;
        UpdateStatus status;
        string declineReason;
        uint256 timestamp;
    }

    // ── CHANGED: version history now stores a full hash snapshot, not just a string ──
    struct MetadataVersion {
        bytes32 metadataHash;
        bytes32 imagesRootHash;
        bytes32 documentsRootHash;
        uint256 timestamp;
        uint256 versionNo;
    }

    // ============ ENUMS ============
    enum RequestStatus { Pending, Approved, Declined }
    enum UpdateStatus  { Pending, Approved, Declined }

    // ============ MAPPINGS ============
    mapping(uint256 => Property) public properties;
    mapping(uint256 => PropertyRequest) public requests;
    mapping(uint256 => OwnershipRecord[]) public ownershipHistory;
    // ── CHANGED: was mapping(uint256 => string[]), now stores full snapshots ──
    mapping(uint256 => MetadataVersion[]) public metadataVersions;
    mapping(uint256 => UpdateRequest[]) public updateRequests;

    // ============ EVENTS ============
    event RequestSubmitted(uint256 indexed requestId, address requester, string name);
    event RequestApproved(uint256 indexed requestId, uint256 propertyId);
    event RequestDeclined(uint256 indexed requestId, string reason);
    event PropertyListed(uint256 indexed propertyId, uint256 price);
    event PropertySold(uint256 indexed propertyId, address from, address to, uint256 price);
    // ── NEW: emitted when a metadata update is approved (backend listens to this) ──
    event MetadataUpdated(uint256 indexed propertyId, uint256 versionNo, bytes32 metadataHash);

    // ============ CONSTRUCTOR ============
    constructor(address _governmentWallet) ERC721("RealEstateNFT", "RENFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        governmentWallet = _governmentWallet;
    }

    // ============ CITIZEN FUNCTIONS ============

    // ── CHANGED: details now carries bytes32 hashes instead of string ipfsHash ──
    // The frontend calls the backend first to get the three hashes,
    // then passes them here inside the details struct, along with the registration fee.
    function submitRequest(PropertyDetails memory details) public payable {
        require(msg.value >= registrationFee, "Insufficient registration fee");

        uint256 requestId = _requestIdCounter;
        _requestIdCounter++;

        // Transfer the registration fee directly to the government wallet
        if (governmentWallet != address(0)) {
            payable(governmentWallet).transfer(msg.value);
        }

        details.price = details.price * 1 ether;

        requests[requestId] = PropertyRequest({
            id: requestId,
            requester: msg.sender,
            details: details,
            status: RequestStatus.Pending,
            declineReason: ""
        });

        emit RequestSubmitted(requestId, msg.sender, details.name);
    }

    function listProperty(uint256 propertyId, uint256 priceInEther) public {
        require(ownerOf(propertyId) == msg.sender, "You don't own this property");
        require(priceInEther > 0, "Price must be greater than 0");
        properties[propertyId].details.isForSale = true;
        properties[propertyId].details.price = priceInEther * 1 ether;
        emit PropertyListed(propertyId, priceInEther * 1 ether);
    }

    function buyProperty(uint256 propertyId) public payable {
        Property storage property = properties[propertyId];
        address seller = ownerOf(propertyId);

        require(property.details.isForSale, "Property is not for sale");
        require(msg.sender != seller, "You already own this property");
        require(msg.value >= property.details.price, "Insufficient funds sent");

        uint256 commission = (msg.value * commissionPercent) / 100;
        uint256 sellerAmount = msg.value - commission;

        this.platformTransfer(seller, msg.sender, propertyId);

        payable(seller).transfer(sellerAmount);
        payable(governmentWallet).transfer(commission);

        ownershipHistory[propertyId].push(OwnershipRecord({
            from: seller,
            to: msg.sender,
            price: msg.value,
            timestamp: block.timestamp
        }));

        property.details.isForSale = false;
        property.owner = msg.sender;

        emit PropertySold(propertyId, seller, msg.sender, msg.value);
    }

    function platformTransfer(address from, address to, uint256 tokenId) external {
        require(msg.sender == address(this), "Only platform allowed");
        _transfer(from, to, tokenId);
    }

    // ============ ADMIN FUNCTIONS ============

    function approveRequest(uint256 requestId) public onlyRole(ADMIN_ROLE) {
        PropertyRequest storage request = requests[requestId];
        require(request.status == RequestStatus.Pending, "Request is not pending");

        request.status = RequestStatus.Approved;

        uint256 propertyId = _propertyIdCounter;
        _propertyIdCounter++;

        _safeMint(request.requester, propertyId);

        properties[propertyId] = Property({
            id: propertyId,
            owner: request.requester,
            details: request.details
        });

        ownershipHistory[propertyId].push(OwnershipRecord({
            from: address(0),
            to: request.requester,
            price: 0,
            timestamp: block.timestamp
        }));

        // ── NEW: store the initial hash snapshot as version 1 ──
        metadataVersions[propertyId].push(MetadataVersion({
            metadataHash:      request.details.metadataHash,
            imagesRootHash:    request.details.imagesRootHash,
            documentsRootHash: request.details.documentsRootHash,
            timestamp:         block.timestamp,
            versionNo:         1
        }));

        emit RequestApproved(requestId, propertyId);
    }

    function declineRequest(uint256 requestId, string memory reason) public onlyRole(ADMIN_ROLE) {
        PropertyRequest storage request = requests[requestId];
        require(request.status == RequestStatus.Pending, "Request is not pending");
        request.status = RequestStatus.Declined;
        request.declineReason = reason;
        emit RequestDeclined(requestId, reason);
    }

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

    // ============ UPDATE FUNCTIONS ============

    // ── CHANGED: takes 3 bytes32 hashes instead of a single string ipfsHash ──
    function submitUpdateRequest(
        uint256 propertyId,
        bytes32 newMetadataHash,
        bytes32 newImagesRootHash,
        bytes32 newDocumentsRootHash
    ) public {
        require(ownerOf(propertyId) == msg.sender, "You don't own this property");

        uint256 updateId = _updateRequestIdCounter;
        _updateRequestIdCounter++;

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

    // ── CHANGED: applies the 3 new hashes and saves old snapshot to version history ──
    function approveUpdateRequest(uint256 propertyId, uint256 updateIndex) public onlyRole(ADMIN_ROLE) {
        UpdateRequest storage request = updateRequests[propertyId][updateIndex];
        require(request.status == UpdateStatus.Pending, "Not pending");

        request.status = UpdateStatus.Approved;

        uint256 newVersionNo = metadataVersions[propertyId].length + 1;

        // Save old hashes to version history before overwriting
        metadataVersions[propertyId].push(MetadataVersion({
            metadataHash:      request.newMetadataHash,
            imagesRootHash:    request.newImagesRootHash,
            documentsRootHash: request.newDocumentsRootHash,
            timestamp:         block.timestamp,
            versionNo:         newVersionNo
        }));

        // Apply new hashes to the live property
        properties[propertyId].details.metadataHash      = request.newMetadataHash;
        properties[propertyId].details.imagesRootHash    = request.newImagesRootHash;
        properties[propertyId].details.documentsRootHash = request.newDocumentsRootHash;

        emit MetadataUpdated(propertyId, newVersionNo, request.newMetadataHash);
    }

    function declineUpdateRequest(uint256 propertyId, uint256 updateIndex, string memory reason) public onlyRole(ADMIN_ROLE) {
        UpdateRequest storage request = updateRequests[propertyId][updateIndex];
        require(request.status == UpdateStatus.Pending, "Not pending");
        request.status = UpdateStatus.Declined;
        request.declineReason = reason;
    }

    // ============ VIEW FUNCTIONS ============

    function getTotalProperties() public view returns (uint256) {
        return _propertyIdCounter;
    }

    function getTotalRequests() public view returns (uint256) {
        return _requestIdCounter;
    }

    function getOwnershipHistory(uint256 propertyId) public view returns (OwnershipRecord[] memory) {
        return ownershipHistory[propertyId];
    }

    function isAdmin(address account) public view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    function getUpdateRequests(uint256 propertyId) public view returns (UpdateRequest[] memory) {
        return updateRequests[propertyId];
    }

    // ── CHANGED: returns MetadataVersion[] instead of string[] ──
    function getMetadataVersions(uint256 propertyId) public view returns (MetadataVersion[] memory) {
        return metadataVersions[propertyId];
    }

    // ── NEW: get just the latest hashes for a property (used by verify route) ──
    function getLatestHashes(uint256 propertyId) public view returns (
        bytes32 metadataHash,
        bytes32 imagesRootHash,
        bytes32 documentsRootHash
    ) {
        PropertyDetails storage d = properties[propertyId].details;
        return (d.metadataHash, d.imagesRootHash, d.documentsRootHash);
    }

    // ============ PLATFORM RESTRICTION ============

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && platformRestricted) {
            require(
                msg.sender == address(this),
                "Transfers only allowed through official platform"
            );
        }
        return super._update(to, tokenId, auth);
    }

    function setPlatformRestricted(bool restricted) public onlyRole(DEFAULT_ADMIN_ROLE) {
        platformRestricted = restricted;
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
