import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import QuickAccess from "./components/QuickAccess";
import { SettingsProvider } from "./contexts/SettingsProvider";
import BackgroundWrapper from "./components/BackgroundWrapper";
import SettingsPanel from "./components/SettingsPanel/SettingsPanel";

function App() {
  const [activePage, setActivePage] = useState("");
  const [presetId, setPresetId] = useState("");

  return (
    <SettingsProvider>
      <div className="relative w-screen h-screen overflow-hidden text-gray-200 font-sans selection:bg-purple-500/30">
        <BackgroundWrapper />
        <div
          className="relative z-10 flex flex-col h-full min-h-0"
          style={
            presetId === "glass" || presetId === "gradient"
              ? {
                  background: "rgba(255,255,255,0)",
                  backdropFilter: "blur(20px)",
                }
              : undefined
          }
        >
          <Navbar activeTab={activePage} setActiveTab={setActivePage} />
          <Dashboard activePage={activePage} />
        </div>
        <SettingsPanel setPresetId={setPresetId} />
      </div>
    </SettingsProvider>
  );
}

export default App;
