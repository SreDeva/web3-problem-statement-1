import React, { useState } from "react";
import { ethers } from "ethers";
import { ContractAbi, contractAddress } from './App'; // Ensure contract ABI and address are correctly imported

const Admin = () => {
  const [insurerAddress, setInsurerAddress] = useState("");
  const [insurerName, setInsurerName] = useState("");
  const [insurerEmail, setInsurerEmail] = useState("");
  const [policyName, setPolicyName] = useState("");
  const [policyAmount, setPolicyAmount] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");
  const [policyIdToRemove, setPolicyIdToRemove] = useState("");
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

  // Add an insurer
  const addInsurer = async () => {
    if (!contract) return;
    try {
      const tx = await contract.addInsurer(insurerAddress, insurerName, insurerEmail);
      await tx.wait();
      alert("Insurer added successfully!");
    } catch (error) {
      console.error("Error adding insurer:", error);
      alert("Error adding insurer.");
    }
  };

  // Remove an insurer
  const removeInsurer = async () => {
    if (!contract) return;
    try {
      const tx = await contract.removeInsurer(insurerAddress);
      await tx.wait();
      alert("Insurer removed successfully!");
    } catch (error) {
      console.error("Error removing insurer:", error);
      alert("Error removing insurer.");
    }
  };

  // Add a policy
  const addPolicy = async () => {
    if (!contract) return;
    try {
      const tx = await contract.addPolicy(
        policyName,
        ethers.utils.parseEther(policyAmount.toString()),
        ethers.utils.parseEther(premiumAmount.toString())
      );
      await tx.wait();
      alert("Policy added successfully!");
    } catch (error) {
      console.error("Error adding policy:", error);
      alert("Error adding policy.");
    }
  };

  // Remove a policy
  const removePolicy = async () => {
    if (!contract) return;
    try {
      const tx = await contract.removePolicy(policyIdToRemove);
      await tx.wait();
      alert("Policy removed successfully!");
    } catch (error) {
      console.error("Error removing policy:", error);
      alert("Error removing policy.");
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={connectToProvider}>Connect Wallet</button>

      <div>
        <h2>Add Insurer</h2>
        <input
          type="text"
          placeholder="Insurer Address"
          value={insurerAddress}
          onChange={(e) => setInsurerAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Insurer Name"
          value={insurerName}
          onChange={(e) => setInsurerName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Insurer Email"
          value={insurerEmail}
          onChange={(e) => setInsurerEmail(e.target.value)}
        />
        <button onClick={addInsurer}>Add Insurer</button>
      </div>

      <div>
        <h2>Remove Insurer</h2>
        <input
          type="text"
          placeholder="Insurer Address"
          value={insurerAddress}
          onChange={(e) => setInsurerAddress(e.target.value)}
        />
        <button onClick={removeInsurer}>Remove Insurer</button>
      </div>

      <div>
        <h2>Add Policy</h2>
        <input
          type="text"
          placeholder="Policy Name"
          value={policyName}
          onChange={(e) => setPolicyName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Policy Amount"
          value={policyAmount}
          onChange={(e) => setPolicyAmount(e.target.value)}
        />
        <input
          type="number"
          placeholder="Premium Amount"
          value={premiumAmount}
          onChange={(e) => setPremiumAmount(e.target.value)}
        />
        <button onClick={addPolicy}>Add Policy</button>
      </div>

      <div>
        <h2>Remove Policy</h2>
        <input
          type="number"
          placeholder="Policy ID to Remove"
          value={policyIdToRemove}
          onChange={(e) => setPolicyIdToRemove(e.target.value)}
        />
        <button onClick={removePolicy}>Remove Policy</button>
      </div>
    </div>
  );
};

export default Admin;
