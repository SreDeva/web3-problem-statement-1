import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ContractAbi, contractAddress } from '../App';
import axios from "axios";
import '../css/Insurer.css';

const PINATA_SECRET_KEY = '710f8fd2ebd66932dc34f88797646fbce7b391a8e6071048c23702f8d654773e';
const PINATA_API_KEY = '338fa16398e5ee8f8dad';

const Insurer = () => {
  const [userAddress, setUserAddress] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [claimId, setClaimId] = useState("");
  const [reason, setReason] = useState("");
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, ContractAbi, signer);

  useEffect(() => {
    const fetchClaims = async () => {
      if (!contract) return;
      try {
        const claimsData = await contract.getAllClaims();
  
        console.log(claimsData); // Log the claims data to inspect
  
        // Fetch details for each claim and handle BigNumber values properly
        const claimsDetails = await Promise.all(
          claimsData.map(async (claim) => {
            // Ensure claimId is a BigNumber and convert it to string
            const claimIdString = ethers.BigNumber.isBigNumber(claim.claimId) ? claim.claimId.toString() : claimId;
  
            const claimDet = await contract.claims(claim.claimId.toString()); // Fetch claim details from contract
            setClaimId(claim.claimId.toString());
            
            console.log(claimDet); // Log the claim details to inspect
  
            // Ensure BigNumber fields are converted to strings
            const policyId = claimDet.policyId ? ethers.BigNumber.isBigNumber(claimDet.policyId) ? claimDet.policyId.toString() : claimDet.policyId : claimDet.policyId;
            const amount = claimDet.amount ? ethers.utils.formatEther(claimDet.amount) : claimDet.amount.toString();
            const status = claimDet.status ? ethers.BigNumber.isBigNumber(claimDet.status) ? claimDet.status.toString() : claimDet.status : claimDet.status;
            const documentHash = claimDet.documentHash || '';
  
            return {
              claimId: claimIdString,        // Convert claimId BigNumber to string
              policyId: policyId,            // Convert policyId BigNumber to string
              amount: amount,                // Convert amount (BigNumber to Ether formatted string)
              status: status,                // Convert status (BigNumber to string)
              documentHash: documentHash,    // Ensure document hash is a string
            };
          })
        );
  
        setClaims(claimsDetails); // Set detailed claim data
      } catch (error) {
        console.error("Error fetching claims:", error);
      }
    };
    fetchClaims();
  }, []);
  
  

  const handleTransaction = async (transaction) => {
    if (!contract) return;
    try {
      const tx = await transaction;
      await tx.wait();
      alert("Transaction successful!");
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Transaction failed.");
    }
  };

  const registerUser = () => handleTransaction(contract.registerUser(userAddress, userName, userEmail));
  const approveClaim = (claimId) => {
    console.log(claimId)
    if (!ethers.BigNumber.isBigNumber(claimId)) {
      // If claimId is not a BigNumber, try to convert it to BigNumber
      claimId = ethers.BigNumber.from(claimId);
    }
  
    // Now that we are sure claimId is a valid BigNumber, pass it to the contract
    handleTransaction(contract.approveClaim(claimId));
  };
  
  const rejectClaim = (claimId, reason) => {
    if (!ethers.BigNumber.isBigNumber(claimId)) {
      // If claimId is not a BigNumber, try to convert it to BigNumber
      claimId = ethers.BigNumber.from(claimId);
    }
  
    // Now that we are sure claimId is a valid BigNumber, pass it to the contract
    handleTransaction(contract.rejectClaim(claimId, reason));
  };
  

  const assignPolicy = async () => {
    if (!contract) return;
    try {
      const userDetails = await contract.users(userAddress);
      const policyDetails = await contract.policy(policyId);

      const policyFileUrl = policyDetails.policyDocHash;
      const response = await axios.get(policyFileUrl);
      const policyData = response.data;

      const combinedData = {
        user: {
          address: userDetails.userAddress,
          name: userDetails.name,
          email: userDetails.email,
        },
        policy: {
          id: policyDetails.policyId.toString(),
          name: policyDetails.policyName,
          amount: ethers.utils.formatEther(policyDetails.policyAmount),
          premium: ethers.utils.formatEther(policyDetails.premiumAmount),
          ...policyData,
        },
      };

      const fileData = new FormData();
      const blob = new Blob([JSON.stringify(combinedData)], { type: "text/plain" });
      const file = new File([blob], "updatedPolicyDetails.txt");
      fileData.append("file", file);

      const uploadResponse = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: fileData,
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          "Content-Type": "multipart/form-data",
        },
      });

      const fileHash = uploadResponse.data.IpfsHash;
      const fileUrl = `https://gateway.pinata.cloud/ipfs/${fileHash}`;
      const fileContentResponse = await axios.get(fileUrl);
      const fileContent = fileContentResponse.data;

      const tx = await contract.assignPolicyToUser(userAddress, policyId, JSON.stringify(fileContent));
      await tx.wait();
      alert("Policy assigned successfully with IPFS content!");
    } catch (error) {
      console.error("Error assigning policy:", error);
      alert("Error assigning policy.");
    }
  };

  return (
    <div>
      <h1>Insurer Dashboard</h1>

      {/* Register User Section */}
      <div>
        <h2>Register User</h2>
        <input
          type="text"
          placeholder="User Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="email"
          placeholder="User Email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <button onClick={registerUser}>Register User</button>
      </div>

      {/* Assign Policy Section */}
      <div>
        <h2>Assign Policy to User</h2>
        <input
          type="text"
          placeholder="User Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Policy ID"
          value={policyId}
          onChange={(e) => setPolicyId(e.target.value)}
        />
        <button onClick={assignPolicy}>Assign Policy</button>
      </div>

      {/* List of Claims as Cards */}
      <div className="claim-cards">
        <h2>All Claims</h2>
        <div className="cards-container">
          {claims.map((claim, index) => (
            <div key={index} className="claim-card" onClick={() => setSelectedClaim(claim)}>
              <h3>Claim ID: {claim.claimId}</h3>
              <p>Policy ID: {claim.policyId}</p>
              <p>Status: {claim.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Claim Details */}
      {selectedClaim && (
        <div className="claim-details">
          <h2>Claim Details</h2>
          <p><strong>Claim ID:</strong> {selectedClaim.claimId}</p>
          <p><strong>Policy ID:</strong> {selectedClaim.policyId}</p>
          <p><strong>Claim Amount:</strong> {selectedClaim.amount} ETH</p>
          <p><strong>Status:</strong> {selectedClaim.status}</p>
          <p><strong>Document Hash:</strong> {selectedClaim.documentHash}</p>
          <div>
            <h3>Reason for Rejection (if any)</h3>
            <textarea
              placeholder="Enter reason for rejection"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="claim-actions">
            <button onClick={() => approveClaim(selectedClaim.claimId)}>Approve</button>
            <button onClick={() => rejectClaim(selectedClaim.claimId, reason)}>Reject</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurer;
