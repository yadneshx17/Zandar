import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import { SettingsProvider } from "./contexts/SettingsProvider";
import BackgroundWrapper from "./components/BackgroundWrapper";
import SettingsPanel from "./components/SettingsPanel/SettingsPanel";
import OnBoardingCard from "./components/OnBoardingCard";
import About from "./components/About";

function App() {
  const [activePage, setActivePage] = useState("");
  const [presetId, setPresetId] = useState("");
  const [started, setStarted] = useState(false);
  const [previewPreset, setPreviewPreset] = useState(null);


  // Initialize cardDismissal from localStorage
  const [cardDismissal, setCardDismissal] = useState(() => {
    const saved = localStorage.getItem("cardDismissal");
    return saved ? JSON.parse(saved) : false;
  });

  // Save cardDismissal to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cardDismissal", JSON.stringify(cardDismissal));
  }, [cardDismissal]);
  useEffect(() => {
    localStorage.setItem("started", JSON.stringify(started));
  }, [started]);

  return (
    <> 
      <SettingsProvider>
        <div className="relative w-screen h-screen overflow-hidden text-gray-200 font-sans selection:bg-purple-500/30">
      
          {/* Background */}
          <BackgroundWrapper previewPreset={previewPreset} />
      
          {/* MAIN APP LAYER */}
          <div
            className="relative z-10 flex flex-col h-full min-h-0 transition-all duration-300 ease-out"
            style={
              presetId === "glass" || presetId === "gradient"
                ? {
                    background: "rgba(255,255,255,0)",
                    backdropFilter: "blur(20px)",
                  }
                : undefined
            }
          >
            <Routes>
              <Route
                path="/"
                element={
                  <div
                    className={`
                      absolute inset-0 transition-all duration-300 ease-out
                      ${cardDismissal
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-2 pointer-events-none"}
                    `}
                  >
                    <Dashboard
                      activePage={activePage}
                      setActivePage={setActivePage}
                    />
                  </div>
                }
              />
      
              <Route
                path="/about"
                element={
                  <About
                    setPresetId={setPresetId}
                    setCardDismissal={setCardDismissal}
                    started={started}
                  />
                }
              />
            </Routes>
          </div>
      
          {/* ONBOARDING OVERLAY */}
          <div
            className={`
              fixed inset-0 z-50 transition-all duration-300 ease-out
              ${cardDismissal
                ? "opacity-0 scale-[0.98] pointer-events-none"
                : "opacity-100 scale-100"}
            `}
          >
            <OnBoardingCard
              cardDismissal={cardDismissal}
              setCardDismissal={setCardDismissal}
              setStarted={setStarted}
              setPresetId={setPresetId}
              setPreviewPreset={setPreviewPreset}
            />
          </div>
      
          {/* SETTINGS */}
          <SettingsPanel
            setPresetId={setPresetId}
            setCardDismissal={setCardDismissal}
          />
        </div>
      </SettingsProvider>
    </>
  );
}

export default App;
