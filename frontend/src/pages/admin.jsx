import React, { useState } from "react";
import { ethers } from "ethers";
import axios from 'axios';
import { ContractAbi, contractAddress } from '../App';
import { PinataSDK } from "pinata-web3";
const PINATA_SECRET_KEY = '710f8fd2ebd66932dc34f88797646fbce7b391a8e6071048c23702f8d654773e';
const PINATA_API_KEY = '338fa16398e5ee8f8dad'; // Ensure contract ABI and address are correctly imported


const Admin = () => {
  const [insurerAddress, setInsurerAddress] = useState("");
  const [insurerName, setInsurerName] = useState("");
  const [insurerEmail, setInsurerEmail] = useState("");
  const [policyName, setPolicyName] = useState("");
  const [policyAmount, setPolicyAmount] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");
  const [policyDocument, setPolicyDocument] = useState(null); // New state for the policy document
  const [policyIdToRemove, setPolicyIdToRemove] = useState("");
  const [ policyDetails, setPolicyDetails] = useState();
  const [account, setAccount] = useState(null);

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, ContractAbi, signer);

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
      const fileData = new FormData();
  
      // Correctly creating a new File object
      const file = new File([policyDetails], "policyDocument.txt", { type: "text/plain" });
      fileData.append('file', file);
  
      const responseData = await axios({
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data: fileData,
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const fileUrl = 'https://gateway.pinata.cloud/ipfs/' + responseData.data.IpfsHash;
      console.log(fileUrl);
      setPolicyDocument(fileUrl);
  
      // Proceed with the transaction
      const tx = await contract.addPolicy(
        policyName,
        ethers.utils.parseEther(policyAmount.toString()),
        ethers.utils.parseEther(premiumAmount.toString()),
        fileUrl  // Use the actual URL received after uploading
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
        <input
           type="text"
           placeholder="Policy Details"
           value={policyDetails}
           onChange={(e) => setPolicyDetails(e.target.value)}
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