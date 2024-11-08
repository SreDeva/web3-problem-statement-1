import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Admin from './pages/admin';
import Home from './pages/Home';
import { BlockProvider, BlockContext } from './context/BlockContext';
import React, { useState, useEffect, useContext } from 'react';
import Insurer from './pages/Insurer';
import User from './pages/User';


export const ContractAbi =  [
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
      },
      {
        "internalType": "string",
        "name": "_policyDocHash",
        "type": "string"
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
      },
      {
        "internalType": "string",
        "name": "__userPolicyDocHash",
        "type": "string"
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
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllClaims",
    "outputs": [
      {
        "components": [
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
          }
        ],
        "internalType": "struct InsuranceClaimsWithUserAndAdmin.Claim[]",
        "name": "",
        "type": "tuple[]"
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
            "internalType": "string",
            "name": "policyDocHash",
            "type": "string"
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
        "internalType": "uint256",
        "name": "_policyId",
        "type": "uint256"
      }
    ],
    "name": "getPolicyByID",
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
            "internalType": "string",
            "name": "policyDocHash",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "validPolicy",
            "type": "bool"
          }
        ],
        "internalType": "struct InsuranceClaimsWithUserAndAdmin.Policy",
        "name": "",
        "type": "tuple"
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
            "internalType": "string",
            "name": "policyDocHash",
            "type": "string"
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
    "inputs": [],
    "name": "isWhatAccount",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
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
        "internalType": "string",
        "name": "policyDocHash",
        "type": "string"
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
    "name": "usersPolicyDocs",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

export const contractAddress = '0x1bA865B10B91a8783425Fa0Cb33D2168e95E6440';
export const provider = "https://polygonzkevm-cardona.g.alchemy.com/v2/q3LpIAKv2V2gdd775yda3khmgS3_el5y";

function App() {
  const [account, setAccount] = useState(null);
  const [accountType, setAccountType] = useState(null);
  
  return (
    <BlockContext.Provider value={{ account, setAccount, accountType, setAccountType }}>
      <Router>
        {/* <Navbar /> */}
        <Routes>
         <Route path="/" element={<Home />} />
          <Route path="/admin" element={accountType == "Admin"? <Admin /> : <Home /> } />
          <Route path="/insurer" element={accountType == "Insurer"?  <Insurer /> : <Home /> } />
          <Route path="/user" element={accountType == "User"? <User /> : <Home /> } />
        </Routes>
      </Router>
      </BlockContext.Provider>
  );
}

export default App;
