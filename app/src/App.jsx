import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import QuickAccess from './components/QuickAccess'
import { SettingsProvider } from './components/SettingsProvider';
import BackgroundWrapper from './components/BackgroundWrapper';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';

function App() {
  const [activePage, setActivePage] = useState("");

  return (
    <SettingsProvider>
      <div className="relative w-full min-h-screen text-gray-200 font-sans selection:bg-purple-500/30">
        <BackgroundWrapper />

        <div className="relative z-10 flex flex-col h-full">
          <Navbar activeTab={activePage} setActiveTab={setActivePage} />
          <Dashboard activePage={activePage} />
        </div>
        <SettingsPanel />
      </div>
    </SettingsProvider>
  );
}

export default App;