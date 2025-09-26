import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TokenInfo from './pages/TokenInfo';
import NFT from './pages/NFT';
import Airdrop from './pages/Airdrop';
import FAQ from './pages/FAQ';
import TransactionHistory from './pages/TransactionHistory';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL || '/'}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/token" element={<TokenInfo />} />
          <Route path="/nft" element={<NFT />} />
          <Route path="/airdrop" element={<Airdrop />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/history" element={<TransactionHistory />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;