import React from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import MapContainer from './components/MapContainer';
import './App.css';

const API_KEY = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

function App() {
  // 調試用：檢查環境變數
  console.log('Environment variables:', {
    API_KEY,
    allEnv: import.meta.env,
    nodeEnv: import.meta.env.MODE
  });
  
  if (!API_KEY) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <i className="fas fa-exclamation-triangle text-warning text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-gray-800 mb-2">API 金鑰未設置</h2>
          <p className="text-gray-600 mb-4">
            請在 .env 文件中設置 VITE_GOOGLE_MAP_API_KEY
          </p>
          <div className="bg-gray-100 p-4 rounded text-left text-sm">
            <code>VITE_GOOGLE_MAP_API_KEY=your_api_key_here</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Wrapper apiKey={API_KEY} libraries={['places']}>
        <MapContainer />
      </Wrapper>
    </div>
  );
}

export default App;