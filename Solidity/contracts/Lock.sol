// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;



contract InsuranceClaimsWithUserAndAdmin {
    enum ClaimStatus { Pending, Approved, Rejected }

	address immutable admin;

	constructor(){
		admin = msg.sender;
	}
    
    struct User {
        address userAddress;
        string name;
        string email;
		uint256[] policyArray;
		bool isUpToDateOnPolicyPayments;
		uint256 no_of_fraud_claims;
        bool isRegistered;
    }

    struct Insurer{
        address insurerAddress;
        string insurerName;
        string email;
        bool isInsurer;
    }

	struct Policy {
		uint256 policyId;
		string policyName;
		uint256 policyAmount;
		uint256 premiumAmount;
        string policyDocHash;
		bool validPolicy;
	}
    
    struct Claim {
        uint256 claimId;
		uint256 policyId;
        address policyholder;
        string documentHash;
        uint256 amount;
        ClaimStatus status;
        uint256 dateOfIncident;
        uint256 dateOfClaim;
    }

    struct ClaimAudit {
        uint256 timestamp;
        ClaimStatus status;
        address actor;
        string actionDetails;
    }

    mapping(address => User) public users;
    mapping(address => Insurer) public insurers;
	mapping(uint256 => Policy) public policy;
    mapping(uint256 => Claim) public claims;
    mapping(address => uint256[]) public userClaims;
    mapping(uint256 => ClaimAudit[]) public claimAudits;
    mapping(address => string[]) public usersPolicyDocs;

    uint256 public claimCounter;
    uint256 public policyCounter;

    event UserRegistered(address indexed userAddress, string name);
	event newPolicyAdded(uint256 indexed policyId, string policyName );
    event addedInsurer(address indexed insurerAddress, string insurerName);
    event ClaimSubmitted(uint256 indexed claimId, address indexed policyholder, uint256 amount);
    event ClaimApproved(uint256 indexed claimId, uint256 amount);
    event ClaimRejected(uint256 indexed claimId, string reason);
    event AuditLog(uint256 indexed claimId, ClaimStatus status, address actor, string actionDetails, uint256 timestamp);

    modifier onlyAdmin() {
        require(admin == msg.sender, "Only admin can call this function.");
        _;
    }

    modifier onlyInsurer() {
        require(insurers[msg.sender].isInsurer , "Only insurer can call this function.");
        _;
    }

    function isWhatAccount() external view returns(string memory){

        if(admin == msg.sender){
        return "Admin";
        }
        else if(insurers[msg.sender].isInsurer){
            return "Insurer";
        }
        else if(users[msg.sender].isRegistered){
            return "User";
        }
        else{
            return "Not registered";
        }
    }


    function addInsurer(address _insurerAddress, string calldata _insurerName, string calldata _email) onlyAdmin external{
        require(!insurers[_insurerAddress].isInsurer , "Insurer already exists");

        insurers[_insurerAddress] = Insurer({
            insurerAddress: _insurerAddress,
            insurerName: _insurerName,
            email: _email,
            isInsurer: true
        });

        emit addedInsurer(_insurerAddress, _insurerName);
    }

    function removeInsurer(address _insurerAddress) external onlyAdmin {
        require(insurers[_insurerAddress].isInsurer, "Insurer does not exist.");

        insurers[_insurerAddress].isInsurer = false;

        emit addedInsurer(_insurerAddress, insurers[_insurerAddress].insurerName);  
    }


	function addPolicy(string calldata _policyName, uint256 _policyAmount, uint256 _premiumAmount, string calldata _policyDocHash) onlyAdmin external{
        policyCounter++;

		policy[policyCounter] = Policy({
			policyId: policyCounter,
			policyName: _policyName,
			policyAmount: _policyAmount,
			premiumAmount: _premiumAmount,
            policyDocHash: _policyDocHash,
			validPolicy: true
		});

		emit newPolicyAdded(policyCounter, _policyName);
	}

    function removePolicy(uint256 _policyId) onlyAdmin external{
        require(_policyId < policyCounter, "Policy does not exist.");
        
		policy[_policyId].validPolicy = false;
    }


    function registerUser(address _userAddress, string calldata _name, string calldata _email) onlyInsurer external {
        require(!users[_userAddress].isRegistered, "User is already registered.");

        users[_userAddress] = User({
            userAddress: _userAddress,
            name: _name,
            email: _email,
			policyArray: new uint256[](0),
			isUpToDateOnPolicyPayments: true,
			no_of_fraud_claims: 0,
            isRegistered: true
        });

        emit UserRegistered(_userAddress, _name);
    }

    function removeUser(address _userAddress) external onlyInsurer {
        require(users[_userAddress].isRegistered, "User is not registered.");
        
        require(users[_userAddress].policyArray.length == 0, "User still has assigned policies.");

        users[_userAddress].isRegistered = false;
        
        emit UserRegistered(_userAddress, users[_userAddress].name);  
    }


    function assignPolicyToUser(address _userAddress, uint256 _policyId, string calldata __userPolicyDocHash) onlyInsurer external{
        require(users[_userAddress].isRegistered, "User is not registered.");
        require(policy[_policyId].validPolicy, "Policy is not valid");

        users[_userAddress].policyArray.push(_policyId);
        usersPolicyDocs[_userAddress].push(__userPolicyDocHash);
    }


    function submitClaim(uint256 _policyId, string calldata _documentHash, uint256 _amount, uint256 _dateOfIncident) external {
        require(users[msg.sender].isRegistered, "User must be registered to submit claims.");
        require(_amount > 0, "Claim amount must be greater than zero.");

        claimCounter++;
        
        Claim memory newClaim = Claim({
            claimId: claimCounter,
            policyId: _policyId,
            policyholder: msg.sender,
            documentHash: _documentHash,
            amount: _amount,
            status: ClaimStatus.Pending,
            dateOfIncident: _dateOfIncident,
            dateOfClaim: block.timestamp
        });

        claims[claimCounter] = newClaim;
        userClaims[msg.sender].push(claimCounter);

        _logAudit(claimCounter, ClaimStatus.Pending, msg.sender, "Claim submitted");
        emit ClaimSubmitted(claimCounter, msg.sender, _amount);
    }


    function approveClaim(uint256 _claimId) external onlyInsurer {
        Claim storage claim = claims[_claimId];
        require(claim.status == ClaimStatus.Pending, "Claim is not pending.");

        claim.status = ClaimStatus.Approved;
        
        _logAudit(_claimId, ClaimStatus.Approved, msg.sender, "Claim approved");
        emit ClaimApproved(_claimId, claim.amount);
    }


    function rejectClaim(uint256 _claimId, string calldata reason) external onlyInsurer {
        Claim storage claim = claims[_claimId];
        require(claim.status == ClaimStatus.Pending, "Claim is not pending.");

        claim.status = ClaimStatus.Rejected;

        if (keccak256(abi.encodePacked(reason)) == keccak256(abi.encodePacked("Fraud"))) {
            users[claim.policyholder].no_of_fraud_claims++;
        }

        _logAudit(_claimId, ClaimStatus.Rejected, msg.sender, string(abi.encodePacked("Claim rejected: ", reason)));
        emit ClaimRejected(_claimId, reason);
    }

    function _logAudit(uint256 _claimId, ClaimStatus _status, address _actor, string memory _actionDetails) internal {
        ClaimAudit memory auditEntry = ClaimAudit({
            timestamp: block.timestamp,
            status: _status,
            actor: _actor,
            actionDetails: _actionDetails
        });

        claimAudits[_claimId].push(auditEntry);
        emit AuditLog(_claimId, _status, _actor, _actionDetails, block.timestamp);
    }


    function getClaimAuditTrail(uint256 _claimId) onlyAdmin external view returns (ClaimAudit[] memory) {
        return claimAudits[_claimId];
    }

    function getUserClaims(address _policyholder) external view returns (uint256[] memory) {
        return userClaims[_policyholder];
    }

    function getPolicysUnderUser(address _userAddress) external view returns (Policy[] memory) {

        uint256[] memory userPolicyIds = users[_userAddress].policyArray;
        
        Policy[] memory userPolicies = new Policy[](userPolicyIds.length);
        
        for (uint256 i = 0; i < userPolicyIds.length; i++) {
            uint256 policyId = userPolicyIds[i];
            userPolicies[i] = policy[policyId]; 
        }
        
        return userPolicies;
    }


    function getAllPolicys() external view returns (Policy[] memory) {
        Policy[] memory allPolicies = new Policy[](policyCounter);
        for (uint256 i = 1; i <= policyCounter; i++) {
                allPolicies[i - 1] = policy[i];
        }
        return allPolicies;
    }

    function getPolicyByID(uint256 _policyId) external view returns(Policy memory){
        require(_policyId <= policyCounter, "Policy does not exist.");
        return policy[_policyId];
    }

}
