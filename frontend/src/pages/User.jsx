import React, { useState } from "react";
import { ethers } from "ethers";
import { ContractAbi, contractAddress } from '../App'; // Ensure contract ABI and address are correctly imported
import axios from "axios";
const User = () => {
  const [userAddress, setUserAddress] = useState("");
  const [userClaims, setUserClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [claimId, setClaimId] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [documentHash, setDocumentHash] = useState("");
  const [amount, setAmount] = useState("");
  const [dateOfIncident, setDateOfIncident] = useState("");
  const [account, setAccount] = useState(null);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, ContractAbi, signer);

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

  // Function to submit a claim
  const submitClaim = async () => {
    if (!contract) return;
    try {
      // Submit the claim to the contract
      await handleTransaction(contract.submitClaim(policyId, documentHash, ethers.utils.parseEther(amount), dateOfIncident));
    } catch (error) {
      console.error("Error submitting claim:", error);
      alert("Error submitting claim.");
    }
  };

  // Function to get the list of claims for the user
  const getUserClaims = async () => {
    if (!contract) return;
    try {
      const claims = await contract.getUserClaims(userAddress);
      setUserClaims(claims);
    } catch (error) {
      console.error("Error fetching user claims:", error);
      alert("Error fetching user claims.");
    }
  };

  // Function to get the policies assigned to the user
  const getPoliciesUnderUser = async () => {
    if (!contract) return;
    try {
      const policies = await contract.getPolicysUnderUser(userAddress);
      setPolicies(policies);
    } catch (error) {
      console.error("Error fetching user policies:", error);
      alert("Error fetching user policies.");
    }
  };

  return (
    <div>
      <h1>User Dashboard</h1>

      <div>
        <h2>Submit Claim</h2>
        <input
          type="text"
          placeholder="Policy ID"
          value={policyId}
          onChange={(e) => setPolicyId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Document Hash"
          value={documentHash}
          onChange={(e) => setDocumentHash(e.target.value)}
        />
        <input
          type="text"
          placeholder="Claim Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="text"
          placeholder="Date of Incident"
          value={dateOfIncident}
          onChange={(e) => setDateOfIncident(e.target.value)}
        />
        <button onClick={submitClaim}>Submit Claim</button>
      </div>

      <div>
        <h2>Get User Claims</h2>
        <input
          type="text"
          placeholder="User Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <button onClick={getUserClaims}>Get Claims</button>
        <ul>
          {userClaims.map((claimId, index) => (
            <li key={index}>Claim ID: {claimId}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Get Policies Assigned to User</h2>
        <input
          type="text"
          placeholder="User Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <button onClick={getPoliciesUnderUser}>Get Policies</button>
        <ul>
          {policies.map((policy, index) => (
            <li key={index}>
              <strong>Policy Name:</strong> {policy.policyName} | 
              <strong> Policy Amount:</strong> {ethers.utils.formatEther(policy.policyAmount)} ETH
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default User;
