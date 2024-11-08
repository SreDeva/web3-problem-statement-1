import React from 'react'
import ConnectWallet from '../components/ConnectWallet';

const Home = () => {
  return (
    
    <div>
        <h1>Employee Login</h1>
        <ConnectWallet />
        <br/>
        <br/>
        <h1>Client Login</h1>
        <ConnectWallet />
    </div>
  )
}

export default Home;