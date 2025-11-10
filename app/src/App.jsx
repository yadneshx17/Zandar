import { useState } from 'react';
import Dashboard from './components/dashboard';
import Navbar from './components/Navbar';
import QuickAccess from './components/QuickAccess'

function App() {
  const [activePage, setActivePage] = useState("");

  return (
    <>
      <Navbar activeTab={activePage} setActiveTab={setActivePage} />
      {/* <QuickAccess /> */}
      <Dashboard activePage={activePage} />
    </>
  );
}

export default App;