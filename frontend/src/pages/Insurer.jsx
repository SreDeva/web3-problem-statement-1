import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ContractAbi, contractAddress } from '../App'; // Ensure contract ABI and address are correctly imported
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
        const claimsData = await contract.getUserClaims(userAddress);
        setClaims(claimsData);
      } catch (error) {
        console.error("Error fetching claims:", error);
      }
    };
    fetchClaims();
  }, [userAddress]);

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
  const approveClaim = (claimId) => handleTransaction(contract.approveClaim(claimId));
  const rejectClaim = (claimId, reason) => handleTransaction(contract.rejectClaim(claimId, reason));

  const assignPolicy = async () => {
    if (!contract) return;
    try {
      const userDetails = await contract.users(userAddress);
      const policyDetails = await contract.policy(policyId);

      const policyFileUrl = policyDetails.policyDocHash;
      const response = await axios.get(policyFileUrl);
      console.log(response)
      const policyData = response.data;

      const combinedData = {
        user: {
          address: userDetails.userAddress,
          name: userDetails.name,
          email: userDetails.email,
        },
        policy: {
          id: policyDetails.policyId,
          name: policyDetails.policyName,
          amount: ethers.utils.formatEther(policyDetails.policyAmount),
          premium: ethers.utils.formatEther(policyDetails.premiumAmount),
          ...policyData,
        },
      };
      console.log(combinedData)

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
          <p><strong>Claim Amount:</strong> {ethers.utils.formatEther(selectedClaim.amount)} ETH</p>
          <p><strong>Date of Incident:</strong> {selectedClaim.dateOfIncident}</p>
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
