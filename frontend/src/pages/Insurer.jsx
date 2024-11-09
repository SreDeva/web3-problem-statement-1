import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ContractAbi, contractAddress } from "../App";
import axios from "axios";
import "../css/Insurer.css";

const PINATA_SECRET_KEY = 'your_pinata_secret_key';
const PINATA_API_KEY = 'your_pinata_api_key';

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
        const claimsDetails = await Promise.all(
          claimsData.map(async (claim) => {
            const claimIdString = ethers.BigNumber.isBigNumber(claim.claimId)
              ? claim.claimId.toString()
              : claimId;
            const claimDet = await contract.claims(claim.claimId.toString());
            return {
              claimId: claimIdString,
              policyId: claimDet.policyId ? claimDet.policyId.toString() : '',
              amount: ethers.utils.formatEther(claimDet.amount),
              status: claimDet.status.toString(),
              documentHash: claimDet.documentHash || '',
            };
          })
        );
        setClaims(claimsDetails);
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

  const registerUser = () =>
    handleTransaction(contract.registerUser(userAddress, userName, userEmail));
  const approveClaim = (claimId) => {
    handleTransaction(contract.approveClaim(ethers.BigNumber.from(claimId)));
  };
  const rejectClaim = (claimId, reason) => {
    handleTransaction(
      contract.rejectClaim(ethers.BigNumber.from(claimId), reason)
    );
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
        user: { address: userDetails.userAddress, name: userDetails.name, email: userDetails.email },
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
      const tx = await contract.assignPolicyToUser(userAddress, policyId, fileHash);
      await tx.wait();
      alert("Policy assigned successfully with IPFS content!");
    } catch (error) {
      console.error("Error assigning policy:", error);
      alert("Error assigning policy.");
    }
  };

  return (
    <div className="insurer-container">
      <h1>Insurer Dashboard</h1>
      <div className="bubble-background">
        <div className="bubble bubble1"></div>
        <div className="bubble bubble2"></div>
        <div className="bubble bubble3"></div>
      </div>

      <div className="register-user">
        <h2>Register User</h2>
        <input type="text" placeholder="User Address" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} />
        <input type="text" placeholder="User Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
        <input type="email" placeholder="User Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
        <button onClick={registerUser}>Register User</button>
      </div>

      <div className="assign-policy">
        <h2>Assign Policy to User</h2>
        <input type="text" placeholder="User Address" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} />
        <input type="text" placeholder="Policy ID" value={policyId} onChange={(e) => setPolicyId(e.target.value)} />
        <button onClick={assignPolicy}>Assign Policy</button>
      </div>

      <div className="claim-cards">
        <h2>All Claims</h2>
        {claims.map((claim, index) => (
          <div key={index} className="claim-card" onClick={() => setSelectedClaim(claim)}>
            <h3>Claim ID: {claim.claimId}</h3>
            <p>Policy ID: {claim.policyId}</p>
            <p>Status: {claim.status}</p>
          </div>
        ))}
      </div>
      {selectedClaim && (
        <div className="claim-details">
          <h2>Claim Details</h2>
          <p><strong>Claim ID:</strong> {selectedClaim.claimId}</p>
          <p><strong>Policy ID:</strong> {selectedClaim.policyId}</p>
          <p><strong>Claim Amount:</strong> {selectedClaim.amount} ETH</p>
          <p><strong>Status:</strong> {selectedClaim.status}</p>
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
