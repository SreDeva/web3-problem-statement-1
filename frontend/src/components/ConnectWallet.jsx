import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { BlockContext } from '../context/BlockContext';
import { ContractAbi } from '../App';
import { contractAddress } from '../App';
import { useNavigate } from 'react-router-dom';

async function getAccountDetails() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(contractAddress, ContractAbi, signer);
  const method = await contract.callStatic.isWhatAccount();
  return method; // Should return "Admin" or another string
}

const ConnectWallet = () => {
  const { account, setAccount, setAccountType } = useContext(BlockContext);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      window.provider = provider;

      // Check if already connected
      provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);

          // Get account details and set account type
          getAccountDetails().then((accountType) => {
            setAccountType(accountType); // Set the account type (e.g., "Admin")
            console.log("Account Type:", accountType); // Logs "Admin"

            // Navigate to Admin page if account is "Admin"
            if (accountType === "Admin") {
              navigate('/admin');
            }
            if (accountType === "Insurer") {
              navigate('/insurer');
            }
            if (accountType === "User") {
              navigate('/user');
            }

          }).catch((error) => {
            console.error("Failed to get account details:", error);
          });
        }
      });
    } else {
      console.log('No Ethereum provider found. Install MetaMask.');
    }
  }, [setAccount, setAccountType, navigate]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);

        // Fetch account type after connecting
        const accountType = await getAccountDetails();
        setAccountType(accountType);

        // Navigate to Admin page if account is "Admin"
        if (accountType === "Admin") {
          navigate('/admin');
        }
      } catch (error) {
        console.error('User denied account access or an error occurred!', error);
      }
    } else {
      console.log('No Ethereum provider found. Install MetaMask.');
    }
  };

  const truncateAddress = (addr) => {
    return addr ? `${addr.substring(0, 5)}...${addr.substring(addr.length - 4)}` : '';
  };

  return (
    <div>
      <button
        className="rounded-md shadow-lg transition duration-300"
        onClick={connectWallet}
      >
        <div className="flex flex-row gap-2 text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet">
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
          </svg>
          <span className="text-yellow-600">{account ? `Connected: ${truncateAddress(account)}` : 'Connect Wallet'}</span>
        </div>
      </button>
    </div>
  );
};

export default ConnectWallet;
