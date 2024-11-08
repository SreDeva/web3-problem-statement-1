import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ContractAbi, contractAddress } from '../App'; // Ensure contract ABI and address are correctly imported
import axios from 'axios';
import { jsPDF } from 'jspdf';

// Pinata API details (replace with your own Pinata credentials)
const PINATA_SECRET_KEY = '710f8fd2ebd66932dc34f88797646fbce7b391a8e6071048c23702f8d654773e';
const PINATA_API_KEY = '338fa16398e5ee8f8dad';

const PINATA_BASE_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

const User = () => {
  const [userClaims, setUserClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [policyId, setPolicyId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState(""); // State to hold the reason for the claim
  const [claimDetails, setClaimDetails] = useState(null); // State to hold claim details
  const [userAddress, setUserAddress] = useState(""); // Store the user's address
  const [validationResponse, setValidationResponse] = useState();

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

  // Function to fetch the user address (sender's address)
  const fetchUserAddress = async () => {
    try {
      const address = await signer.getAddress(); // Fetch user's address from the signer
      setUserAddress(address);
    } catch (error) {
      console.error("Error fetching user address:", error);
      alert("Error fetching user address.");
    }
  };

  // Fetch the policies assigned to the user
  async function getPoliciesAssignedToUser(userAddress) {
    try {
      const policies = await contract.getPolicysUnderUser(userAddress);
      return policies; // Return the policies for further use
    } catch (error) {
      console.error("Error fetching policies:", error);
      alert("Error fetching policies.");
      return [];
    }
  }

  // Function to submit a claim
  const submitClaim = async () => {
    console.log('userAddress:', userAddress);
    console.log('policyId:', policyId);
    console.log('amount:', amount);
    console.log('reason:', reason); // Log the reason

    if (!contract) return;
    try {
      // Check if all fields are filled
      if (!userAddress.trim() || !policyId.trim() || !amount.trim() || !reason.trim()) {
        alert("Please fill in all fields.");
        return;
      }

      const policies = await getPoliciesAssignedToUser(userAddress); // If the policy doesn't exist in the user's assigned policies, show an error
      const polici = policies.find(p => p.policyId.toString() === policyId.toString());
      if (!polici) {
        alert("You do not have this policy assigned to you.");
        return;
      }

      const policyDocumentUrl = polici.policyDocHash;

      console.log("Policy Document URL: ", policyDocumentUrl);

      // Fetch document content directly from the IPFS public gateway
      const response = await axios.get(policyDocumentUrl, {
        responseType: "text" // Assuming the file is in text or HTML format
      });

      const policyDocument = response.data;
      console.log("File content retrieved successfully:", policyDocument);

      // Create PDF from the file content
      const policyDoc = new jsPDF();

      // Add text content to PDF (you can customize this based on your file type)
      policyDoc.text(policyDocument, 10, 10); // Add content at coordinates (10, 10)

      // Save or display the generated PDF
      policyDoc.save('policyDocument.pdf'); // Save the PDF file as 'policyDocument.pdf'

      // Fetch the user's information (e.g., from their policy)
      const userInfo = await contract.users(userAddress);
      const policy = await contract.policy(policyId); // Get policy details

      // Create a document object with user's info and claim details, including the reason
      const claimDocument = {
        userAddress: userAddress,
        policyId: policyId,
        policyName: policy.policyName,
        policyholder: userInfo.policyholder,
        documentHash: "", // This will be filled once uploaded to IPFS
        amount: amount,
        claimStatus: "Pending", // Assume status is pending when created
        claimDetails: {
          claimAmount: amount,
          claimReason: reason, // Append the claim reason here
        },
        createdAt: new Date().toISOString(),
      };


    // Create the claim document text as a string
    const claimText = `
      User Address: ${claimDocument.userAddress}
      Policy ID: ${claimDocument.policyId}
      Policy Name: ${claimDocument.policyName}
      Policyholder: ${claimDocument.policyholder}
      Amount: ${claimDocument.amount}
      Claim Status: ${claimDocument.claimStatus}
      Claim Amount: ${claimDocument.claimDetails.claimAmount}
      Claim Reason: ${claimDocument.claimDetails.claimReason}
      Created At: ${claimDocument.createdAt}
    `;

    // Create PDF for the claim document
    const claimDoc = new jsPDF();
    claimDoc.text(claimText, 10, 10); // Add claim information as text
    claimDoc.save('claimDocument.pdf'); // Save the PDF file as 'claimDocument.pdf'

    console.log(policyDoc, claimDoc);

    const policyBlob = new Blob([policyDoc.output("blob")], { type: "application/pdf" });      
    const claimBlob = new Blob([claimDoc.output("blob")], { type: "application/pdf" });

    const formData = new FormData();
    formData.append("policy_pdf", policyBlob, "policy.pdf");
    formData.append("claim_pdf", claimBlob, "claim.pdf");

    const validation = await axios.post("http://localhost:8000/validate-claim/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const validityResponse = JSON.parse(validation.data.validity_response);
    if (!validityResponse.valid) {
      alert("Fraudulent claim");
      return;
    }

    setValidationResponse(validityResponse.reason);


      // Upload the document to IPFS using Pinata
      const documentHash = await uploadToPinata(claimDocument);

      // Now update the document hash in the claim document
      claimDocument.documentHash = documentHash;

      // Submit the claim to the smart contract with the document hash
      await handleTransaction(contract.submitClaim(policyId, documentHash, ethers.utils.parseEther(amount)));
    } catch (error) {
      console.error("Error submitting claim:", error);
      alert("Error submitting claim.");
    }
  };

  // Function to upload the claim document to Pinata
  const uploadToPinata = async (document) => {
    try {
      const response = await axios.post(PINATA_BASE_URL, document, {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY,
          'Content-Type': 'application/json',
        },
      });

      // Get the IPFS hash of the uploaded document
      const documentHash = response.data.IpfsHash;
      console.log("Document uploaded to IPFS. Hash:", documentHash);
      return `https://gateway.pinata.cloud/ipfs/${documentHash}`;
    } catch (error) {
      console.error("Error uploading document to Pinata:", error);
      alert("Error uploading document to IPFS.");
    }
  };

  // Function to get the list of claims for the user
  const getUserClaims = async () => {
    if (!contract) return;
    try {
      const claims = await contract.getUserClaims(userAddress);
      
      // Convert each claim ID (BigNumber) to a string
      const claimIds = claims.map(claim => claim.toString());
      console.log(claimIds);

      setUserClaims(claimIds); // Now setting the claims as strings
    } catch (error) {
      console.error("Error fetching user claims:", error);
      alert("Error fetching user claims.");
    }
  };

  // Function to get the claim details by ID
  const getClaimDetails = async (claimId) => {
    if (!contract) return;
    try {
      // Accessing the claims mapping by claimId
      const claim = await contract.claims(claimId);

      // Convert the BigNumber values to a more readable format
      const formattedClaimDetails = {
        claimId: claimId,
        policyId: claim.policyId.toString(), // Ensure policyId is a string
        policyholder: claim.policyholder,
        documentHash: claim.documentHash,
        amount: ethers.utils.formatEther(claim.amount), // Convert BigNumber to Ether format
        status: claim.status.toString() === "0" ? "Pending" : claim.status.toString() === "1" ? "Approved" : "Rejected", // Convert status to human-readable format
      };

      setClaimDetails(formattedClaimDetails);
    } catch (error) {
      console.error("Error fetching claim details:", error);
      alert("Error fetching claim details.");
    }
  };

  // Function to get the policies assigned to the user
  const getPoliciesUnderUser = async () => {
    if (!contract) return;
    try {
      const policies = await contract.getPolicysUnderUser(userAddress);
      
      // Format policy amounts from BigNumber to Ether
      const formattedPolicies = policies.map((policy) => ({
        ...policy,
        policyAmount: ethers.utils.formatEther(policy.policyAmount), // Convert policy amount to Ether format
      }));

      setPolicies(formattedPolicies);
    } catch (error) {
      console.error("Error fetching user policies:", error);
      alert("Error fetching user policies.");
    }
  };

  // Fetch user address on component mount
  useEffect(() => {
    fetchUserAddress(); // Automatically fetch user's address
  }, []);

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
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <textarea
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>
        <button onClick={submitClaim}>Submit Claim</button>
      </div>

      <div>
        <h2>Your Claims</h2>
        {userClaims.length > 0 ? (
          userClaims.map((claimId) => (
            <div key={claimId}>
              <h3>Claim ID: {claimId}</h3>
              <button onClick={() => getClaimDetails(claimId)}>
                View Claim Details
              </button>
            </div>
          ))
        ) : (
          <p>No claims submitted yet.</p>
        )}
      </div>

      <div>
        <h2>Your Policies</h2>
        {policies.length > 0 ? (
          policies.map((policy) => (
            <div key={policy.policyId}>
              <h3>Policy ID: {policy.policyId}</h3>
              <p>Amount: {policy.policyAmount} ETH</p>
            </div>
          ))
        ) : (
          <p>No policies assigned to you.</p>
        )}
      </div>
    </div>
  );
};

export default User;
