// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CertificateRegistry
 * @dev Blockchain-based certificate verification system
 */
contract CertificateRegistry {
    
    // Certificate Status
    enum CertificateStatus { ACTIVE, REVOKED, SUPERSEDED, PENDING }
    
    // Certificate Structure
    struct Certificate {
        string certificateId;
        address issuer;
        address owner;
        string certificateHash; // SHA-256 hash
        uint256 issueDate;
        uint256 expiryDate;
        string skillName;
        CertificateStatus status;
        string metadata; // Additional info (JSON)
        uint256 version;
    }
    
    // Version History
    struct VersionHistory {
        uint256 version;
        string certificateHash;
        uint256 timestamp;
        CertificateStatus status;
        address updatedBy;
    }
    
    // State Variables
    mapping(string => Certificate) public certificates;
    mapping(string => VersionHistory[]) public versionHistories;
    mapping(string => uint256) public certificateVersions;
    
    address[] public issuers;
    mapping(address => bool) public isAuthorizedIssuer;
    
    // Events
    event CertificateCreated(
        string indexed certificateId,
        address indexed issuer,
        address indexed owner,
        string skillName,
        uint256 timestamp
    );
    
    event CertificateUpdated(
        string indexed certificateId,
        uint256 newVersion,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        string indexed certificateId,
        uint256 timestamp
    );
    
    event IssuerAuthorized(address indexed issuer);
    
    // Modifiers
    modifier onlyAuthorizedIssuer() {
        require(isAuthorizedIssuer[msg.sender], "Not authorized issuer");
        _;
    }
    
    modifier certificateExists(string memory _certificateId) {
        require(
            certificates[_certificateId].issueDate != 0,
            "Certificate does not exist"
        );
        _;
    }
    
    // Constructor
    constructor() {
        isAuthorizedIssuer[msg.sender] = true;
        issuers.push(msg.sender);
    }
    
    // Authorize new issuer (only current issuer)
    function authorizeIssuer(address _issuer) public onlyAuthorizedIssuer {
        require(_issuer != address(0), "Invalid issuer address");
        require(!isAuthorizedIssuer[_issuer], "Already authorized");
        
        isAuthorizedIssuer[_issuer] = true;
        issuers.push(_issuer);
        emit IssuerAuthorized(_issuer);
    }
    
    // Create Certificate
    function createCertificate(
        string memory _certificateId,
        address _owner,
        string memory _skillName,
        string memory _certificateHash,
        uint256 _expiryDate,
        string memory _metadata
    ) public onlyAuthorizedIssuer returns (bool) {
        require(
            certificates[_certificateId].issueDate == 0,
            "Certificate already exists"
        );
        require(_owner != address(0), "Invalid owner address");
        require(bytes(_certificateHash).length > 0, "Invalid hash");
        
        Certificate storage cert = certificates[_certificateId];
        cert.certificateId = _certificateId;
        cert.issuer = msg.sender;
        cert.owner = _owner;
        cert.certificateHash = _certificateHash;
        cert.issueDate = block.timestamp;
        cert.expiryDate = _expiryDate;
        cert.skillName = _skillName;
        cert.status = CertificateStatus.ACTIVE;
        cert.metadata = _metadata;
        cert.version = 1;
        
        certificateVersions[_certificateId] = 1;
        
        // Record version history
        versionHistories[_certificateId].push(VersionHistory({
            version: 1,
            certificateHash: _certificateHash,
            timestamp: block.timestamp,
            status: CertificateStatus.ACTIVE,
            updatedBy: msg.sender
        }));
        
        emit CertificateCreated(
            _certificateId,
            msg.sender,
            _owner,
            _skillName,
            block.timestamp
        );
        
        return true;
    }
    
    // Update Certificate (create new version)
    function updateCertificate(
        string memory _certificateId,
        string memory _newHash,
        string memory _metadata
    ) public onlyAuthorizedIssuer certificateExists(_certificateId) returns (bool) {
        Certificate storage cert = certificates[_certificateId];
        require(cert.status != CertificateStatus.REVOKED, "Certificate revoked");
        require(bytes(_newHash).length > 0, "Invalid hash");
        
        // Mark old version as superseded
        if (cert.status == CertificateStatus.ACTIVE) {
            cert.status = CertificateStatus.SUPERSEDED;
        }
        
        // Increment version
        uint256 newVersion = cert.version + 1;
        cert.version = newVersion;
        cert.certificateHash = _newHash;
        cert.metadata = _metadata;
        cert.status = CertificateStatus.ACTIVE;
        
        certificateVersions[_certificateId] = newVersion;
        
        // Record version history
        versionHistories[_certificateId].push(VersionHistory({
            version: newVersion,
            certificateHash: _newHash,
            timestamp: block.timestamp,
            status: CertificateStatus.ACTIVE,
            updatedBy: msg.sender
        }));
        
        emit CertificateUpdated(_certificateId, newVersion, block.timestamp);
        
        return true;
    }
    
    // Revoke Certificate
    function revokeCertificate(string memory _certificateId)
        public
        onlyAuthorizedIssuer
        certificateExists(_certificateId)
        returns (bool)
    {
        Certificate storage cert = certificates[_certificateId];
        require(cert.status != CertificateStatus.REVOKED, "Already revoked");
        
        cert.status = CertificateStatus.REVOKED;
        
        // Record revocation in version history
        versionHistories[_certificateId].push(VersionHistory({
            version: cert.version,
            certificateHash: cert.certificateHash,
            timestamp: block.timestamp,
            status: CertificateStatus.REVOKED,
            updatedBy: msg.sender
        }));
        
        emit CertificateRevoked(_certificateId, block.timestamp);
        
        return true;
    }
    
    // Verify Certificate
    function verifyCertificate(string memory _certificateId, string memory _hash)
        public
        view
        certificateExists(_certificateId)
        returns (bool isValid, CertificateStatus status)
    {
        Certificate memory cert = certificates[_certificateId];
        
        bool hashMatches = keccak256(abi.encodePacked(cert.certificateHash)) ==
                          keccak256(abi.encodePacked(_hash));
        
        bool isActive = cert.status == CertificateStatus.ACTIVE;
        bool notExpired = cert.expiryDate == 0 || cert.expiryDate > block.timestamp;
        
        return (
            hashMatches && isActive && notExpired,
            cert.status
        );
    }
    
    // Get Certificate
    function getCertificate(string memory _certificateId)
        public
        view
        certificateExists(_certificateId)
        returns (Certificate memory)
    {
        return certificates[_certificateId];
    }
    
    // Get Version History
    function getVersionHistory(string memory _certificateId)
        public
        view
        returns (VersionHistory[] memory)
    {
        return versionHistories[_certificateId];
    }
    
    // Get Certificate Status
    function getCertificateStatus(string memory _certificateId)
        public
        view
        certificateExists(_certificateId)
        returns (CertificateStatus)
    {
        return certificates[_certificateId].status;
    }
    
    // Check if issuer is authorized
    function getAuthorizedIssuers() public view returns (address[] memory) {
        return issuers;
    }
}