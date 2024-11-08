// insurer.js
import React, { useState } from "react";
import { ethers } from "ethers";
import { ContractAbi, contractAddress } from './App'; // Ensure contract ABI and address are correctly imported

const Insurer = () => {
  const [userAddress, setUserAddress] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [policyholder, setPolicyholder] = useState("");
  const [claimId, setClaimId] = useState("");
  const [reason, setReason] = useState("");
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  // Connect to Ethereum provider (MetaMask)
  const connectToProvider = async () => {
    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(prov);
      const signer = prov.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, ContractAbi, signer);
      setContract(contractInstance);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  // Register a user
  const registerUser = async () => {
    if (!contract) return;
    try {
      const tx = await contract.registerUser(userAddress, userName, userEmail);
      await tx.wait();
      alert("User registered successfully!");
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error registering user.");
    }
  };

  // Remove a user
  const removeUser = async () => {
    if (!contract) return;
    try {
      const tx = await contract.removeUser(userAddress);
      await tx.wait();
      alert("User removed successfully!");
    } catch (error) {
      console.error("Error removing user:", error);
      alert("Error removing user.");
    }
  };

  // Assign a policy to a user
  const assignPolicyToUser = async () => {
    if (!contract) return;
    try {
      const tx = await contract.assignPolicyToUser(userAddress, policyId);
      await tx.wait();
      alert("Policy assigned to user successfully!");
    } catch (error) {
      console.error("Error assigning policy:", error);
      alert("Error assigning policy.");
    }
  };

  // Approve a claim
  const approveClaim = async () => {
    if (!contract) return;
    try {
      const tx = await contract.approveClaim(claimId);
      await tx.wait();
      alert("Claim approved successfully!");
    } catch (error) {
      console.error("Error approving claim:", error);
      alert("Error approving claim.");
    }
  };

  // Reject a claim
  const rejectClaim = async () => {
    if (!contract) return;
    try {
      const tx = await contract.rejectClaim(claimId, reason);
      await tx.wait();
      alert("Claim rejected successfully!");
    } catch (error) {
      console.error("Error rejecting claim:", error);
      alert("Error rejecting claim.");
    }
  };

  return (
    <div>
      <h1>Insurer Dashboard</h1>
      <button onClick={connectToProvider}>Connect Wallet</button>

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

      <div>
        <h2>Remove User</h2>
        <input
          type="text"
          placeholder="User Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <button onClick={removeUser}>Remove User</button>
      </div>

      <div>
        <h2>Assign Policy to User</h2>
        <input
          type="text"
          placeholder="User Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <input
          type="number"
          placeholder="Policy ID"
          value={policyId}
          onChange={(e) => setPolicyId(e.target.value)}
        />
        <button onClick={assignPolicyToUser}>Assign Policy</button>
      </div>

      <div>
        <h2>Approve Claim</h2>
        <input
          type="number"
          placeholder="Claim ID"
          value={claimId}
          onChange={(e) => setClaimId(e.target.value)}
        />
        <button onClick={approveClaim}>Approve Claim</button>
      </div>

      <div>
        <h2>Reject Claim</h2>
        <input
          type="number"
          placeholder="Claim ID"
          value={claimId}
          onChange={(e) => setClaimId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button onClick={rejectClaim}>Reject Claim</button>
      </div>
    </div>
  );
};

export default Insurer;
