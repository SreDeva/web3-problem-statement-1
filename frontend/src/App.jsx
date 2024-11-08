import React, { useState, useEffect } from 'react';
import Admin from './Admin';
import Insurer from './Insurer';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

export const ContractAbi =   [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum InsuranceClaimsWithUserAndAdmin.ClaimStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "actor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "actionDetails",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "AuditLog",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "ClaimApproved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "ClaimRejected",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "policyholder",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "ClaimSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "insurerAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "insurerName",
          "type": "string"
        }
      ],
      "name": "addedInsurer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "policyId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "policyName",
          "type": "string"
        }
      ],
      "name": "newPolicyAdded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_insurerAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_insurerName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        }
      ],
      "name": "addInsurer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_policyName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_policyAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_premiumAmount",
          "type": "uint256"
        }
      ],
      "name": "addPolicy",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_claimId",
          "type": "uint256"
        }
      ],
      "name": "approveClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_userAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_policyId",
          "type": "uint256"
        }
      ],
      "name": "assignPolicyToUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "claimAudits",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "enum InsuranceClaimsWithUserAndAdmin.ClaimStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "actor",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "actionDetails",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "claims",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "claimId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "policyId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "policyholder",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "documentHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "enum InsuranceClaimsWithUserAndAdmin.ClaimStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint256",
          "name": "dateOfIncident",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "dateOfClaim",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllPolicys",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "policyId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "policyName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "policyAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "premiumAmount",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "validPolicy",
              "type": "bool"
            }
          ],
          "internalType": "struct InsuranceClaimsWithUserAndAdmin.Policy[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_claimId",
          "type": "uint256"
        }
      ],
      "name": "getClaimAuditTrail",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "enum InsuranceClaimsWithUserAndAdmin.ClaimStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "actor",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "actionDetails",
              "type": "string"
            }
          ],
          "internalType": "struct InsuranceClaimsWithUserAndAdmin.ClaimAudit[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_userAddress",
          "type": "address"
        }
      ],
      "name": "getPolicysUnderUser",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "policyId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "policyName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "policyAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "premiumAmount",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "validPolicy",
              "type": "bool"
            }
          ],
          "internalType": "struct InsuranceClaimsWithUserAndAdmin.Policy[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_policyholder",
          "type": "address"
        }
      ],
      "name": "getUserClaims",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "insurers",
      "outputs": [
        {
          "internalType": "address",
          "name": "insurerAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "insurerName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isInsurer",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "policy",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "policyId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "policyName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "policyAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "premiumAmount",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "validPolicy",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "policyCounter",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_userAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_email",
          "type": "string"
        }
      ],
      "name": "registerUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_claimId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
        }
      ],
      "name": "rejectClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_insurerAddress",
          "type": "address"
        }
      ],
      "name": "removeInsurer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_policyId",
          "type": "uint256"
        }
      ],
      "name": "removePolicy",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_userAddress",
          "type": "address"
        }
      ],
      "name": "removeUser",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_policyId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_documentHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_dateOfIncident",
          "type": "uint256"
        }
      ],
      "name": "submitClaim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "userClaims",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "users",
      "outputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "isUpToDateOnPolicyPayments",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "no_of_fraud_claims",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isRegistered",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

export const contractAddress = '0x037EC38B8Fd13DAB8Dae35d3B59Ffaa0DE49eC06';
export const provider = "https://polygonzkevm-cardona.g.alchemy.com/v2/q3LpIAKv2V2gdd775yda3khmgS3_el5y";

const App = () => {
  const [account, setAccount] = useState(null);
  const [prov, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  // Wrap everything inside the Router
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/insurer" element={<Insurer />} />
      </Routes>
    </Router>
  );
};

const MainApp = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const navigate = useNavigate(); // Use navigate inside the Router context

  useEffect(() => {
    if (account) {
      checkUserRole(account);
    }
  }, [account]);

  // Connect to Ethereum provider (MetaMask)
  const connectToProvider = async () => {
    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      const signer = prov.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, ContractAbi, signer);
      setContract(contractInstance);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  // Check if the connected account is admin or insurer
  const checkUserRole = async (connectedAccount) => {
    if (!contract) return;

    try {
      // Check if connected account is admin (admin address should be hardcoded in the contract)
      const admin = "0x743423B0aFa89619c29082f5d2f36E9317cb63fa";
      if (connectedAccount === admin) {
        navigate('/admin');
      } else {
        // Check if the connected account is an insurer
        const insurer = await contract.insurers(connectedAccount);
        if (insurer.isInsurer) {
          navigate('/insurer');
        } else {
          alert("You are not authorized as an admin or insurer.");
        }
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      alert("Error checking user role.");
    }
  };

  return (
    <div>
      <h1>Insurance Claims Management</h1>
      <button onClick={connectToProvider}>Connect Wallet</button>
    </div>
  );
};

export default App;
