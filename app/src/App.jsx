import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import QuickAccess from "./components/QuickAccess";
import { SettingsProvider } from "./contexts/SettingsProvider";
import BackgroundWrapper from "./components/BackgroundWrapper";
import SettingsPanel from "./components/SettingsPanel/SettingsPanel";
import OnBoardingCard from "./components/OnBoardingCard";
import About from "./components/About";

function App() {
  const [activePage, setActivePage] = useState("");
  const [presetId, setPresetId] = useState("");
  const [cardDismissal, setCardDismissal] = useState(false);

  return (
    <>
      {!cardDismissal && (
        <div className="fixed inset-0 z-50">
          <OnBoardingCard cardDismissal={cardDismissal} setCardDismissal={setCardDismissal} />
        </div>
      )}
      <SettingsProvider>
        <div
          className="relative w-screen h-screen overflow-hidden text-gray-200 font-sans selection:bg-purple-500/30"

          // className={`relative w-screen h-screen overflow-hidden text-gray-200 font-sans selection:bg-purple-500/30 ${
          //   cardDismissal
          //     ? "animate-fade-in"
          //     : "opacity-0 pointer-events-none"
          // }`}
        >
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
            {/* <Navbar activeTab={activePage} setActiveTab={setActivePage} />*/}
            <Routes>
              <Route path="/" element={<Dashboard activePage={activePage} setActivePage={setActivePage} />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
          <SettingsPanel setPresetId={setPresetId} setCardDismissal={setCardDismissal}  />
        </div>
      </SettingsProvider>
    </>
  );
}

export default App;
