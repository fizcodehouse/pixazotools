import { useState, useEffect } from 'react';
import './App.css';
import FluxTab from './tabs/FluxTab';
import SdxlTab from './tabs/SdxlTab';
import LtxImgToVideoTab from './tabs/LtxImgToVideoTab';
import LtxTextToVideoTab from './tabs/LtxTextToVideoTab';
import TracksTab from './tabs/TracksTab';

const TABS = [
  { id: 'flux', label: 'Flux Image', icon: '🖼️' },
  { id: 'sdxl', label: 'SDXL Image', icon: '🎨' },
  { id: 'ltx-img', label: 'Img→Video', icon: '🎬' },
  { id: 'ltx-txt', label: 'Txt→Video', icon: '📽️' },
  { id: 'tracks', label: 'Song', icon: '🎵' },
];

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('pixazo_api_key') || '');
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  useEffect(() => {
    if (apiKey) localStorage.setItem('pixazo_api_key', apiKey);
  }, [apiKey]);

  const renderTab = () => {
    if (!apiKey) {
      return (
        <div className="tab-content">
          <div className="no-key-message">
            <h2>Enter your Pixazo API Key above to get started</h2>
            <p>Your key is stored locally in your browser and never sent anywhere except Pixazo's API.</p>
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case 'flux': return <FluxTab apiKey={apiKey} />;
      case 'sdxl': return <SdxlTab apiKey={apiKey} />;
      case 'ltx-img': return <LtxImgToVideoTab apiKey={apiKey} />;
      case 'ltx-txt': return <LtxTextToVideoTab apiKey={apiKey} />;
      case 'tracks': return <TracksTab apiKey={apiKey} />;
      default: return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">PixazoTools</h1>
        <p className="app-subtitle">Image · Video · Music Generator</p>
        <div className="api-key-row">
          <label htmlFor="api-key-input" className="api-key-label">Ocp-Apim-Subscription-Key:</label>
          <input
            id="api-key-input"
            type="password"
            className="api-key-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your Pixazo API key…"
          />
          <button
            className="btn-toggle-key"
            onClick={() => {
              const el = document.getElementById('api-key-input');
              if (el) el.type = el.type === 'password' ? 'text' : 'password';
            }}
            title="Toggle visibility"
          >
            👁️
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {renderTab()}
      </main>

      <footer className="app-footer">
        <p>Powered by <a href="https://pixazo.ai" target="_blank" rel="noreferrer">Pixazo AI</a></p>
      </footer>
    </div>
  );
}

export default App;
