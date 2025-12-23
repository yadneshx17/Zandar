import React, { useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar";
import BackupManager from "./BackupManager.jsx";
import { db } from "../../services/db/schema.js";
import { SettingsContext } from "../../contexts/SettingsProvider";
import { Broom } from "@phosphor-icons/react";
import { X, Database, Images, Upload, Check, Command, Moon, Sun } from "lucide-react";

const PANEL_WIDTH_MOBILE = "100vw";
const PANEL_WIDTH_DESKTOP = "360px";

const SettingsPanel = ({ setPresetId, setCardDismissal }) => {
  // const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const {
    settingsOpen,
    setSettingsOpen,
    bgType,
    setBgType,
    handleFileUpload,
    bgFileName,

    // adjustments
    bgBlur,
    setBgBlur,
    bgBrightness,
    setBgBrightness,
    widgetOpacity,
    setWidgetOpacity,
    bgPreset,
    setBgPreset,
  } = useContext(SettingsContext);

  
  const BG_PRESETS = [
    {
      id: "glass",
      label: "Glass",
      type: "preset",
      bg: "/assets/backgrounds/glass.jpg",
      defaults: {
        blur: 20,
        brightness: 100,
        widgetOpacity: 20,
      },
    },
    {
      id: "nature",
      label: "Nature",
      type: "preset",
      bg: "/assets/backgrounds/nature.jpg",
      defaults: {
        blur: 14,
        brightness: 92,
        widgetOpacity: 34,
      },
    },
    {
      id: "abstract",
      label: "Abstract",
      type: "preset",
      bg: "/assets/backgrounds/gradient.jpg",
      defaults: {
        blur: 11,
        brightness: 100,
        widgetOpacity: 20,
      },
    },
    {
      id: "vibrant",
      label: "Vibrant",
      type: "preset",
      bg: "/assets/backgrounds/vibrant.jpg",
      defaults: {
        blur: 18,
        brightness: 100,
        widgetOpacity: 36,
      },
    },
    {
      id: "game",
      label: "Game",
      type: "preset",
      bg: "/assets/backgrounds/game.jpg",
      defaults: {
        blur: 18,
        brightness: 100,
        widgetOpacity: 26,
      },
    },
  ];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && settingsOpen) {
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [settingsOpen, setSettingsOpen]);
  
  const handleReset = async () => {
    if (confirm("Delete all data and reset? :)")) {
      await db.delete();
      
      const keys = ["bgBlur", "bgBrightness", "bgPreset", "bgIsVideo", "bgImageKey", "bgType" ,"cardDismissal", "started", "widgetOpacity"]
      
      keys.map((key) => {
        localStorage.removeItem(key)
        // console.log(key)
      })
      window.location.reload();
    }
  }

  const applyPreset = (presetId) => {
    const preset = BG_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setBgPreset(presetId);
    localStorage.setItem("bgPreset", presetId);

    setBgType("preset");
    localStorage.setItem("bgType", "preset");
    setPresetId(preset.id);
    setBgBlur(preset.defaults.blur);
    setBgBrightness(preset.defaults.brightness);
    setWidgetOpacity(preset.defaults.widgetOpacity);
  };

  return (
    <>
      {/* Backdrop */}
      {settingsOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 animate-in fade-in duration-200"
          onClick={() => setSettingsOpen(false)}
        />
      )}

      {/* Settings Panel - Slides from RIGHT on desktop, from BOTTOM on mobile */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-[#1A1A1A] border-l border-neutral-700 z-50
          shadow-[-4px_0_20px_rgba(0,0,0,0.5)] overflow-hidden
          transition-transform duration-300 ease-out flex flex-col
          w-full sm:w-[360px]
          ${settingsOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="sticky top-0 bg-[#161616] border-b border-neutral-700 z-20">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 select-none">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <h2 className="text-lg text-white font-medium tracking-wide">
                  Zandar <span className="text-xs">v0.1.0</span>
                </h2>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-white hover:text-neutral-400 p-1.5 rounded transition-all"
                aria-label="Close settings"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          {/* <div className="px-4 py-2">
            <SearchBar
              // value={searchQuery}
              // onChange={setSearchQuery}
              placeholder="Search Settings"
            />
            {searchQuery && (
              <div className="mt-4 text-white">
                Searching for: {searchQuery}
              </div>
            )}
          </div>*/}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto select-none">
          {/* Background Media */}
          <div>
            <div className="flex items-center mb-1">
              <h3 className="text-base text-white">Appearance</h3>
            </div>

            <div className="space-y-4 pt-4">
              {/*  PRESET */}
              <div>
                <div className="text-sm text-[#A4A4A4] tracking-wide mb-3">
                  Presets
                </div>

                <div className="grid grid-cols-5 sm:flex sm:gap-3 gap-2">
                  {BG_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`flex flex-col items-center gap-1 transition-opacity ${
                        bgPreset === preset.id
                          ? "opacity-100"
                          : "opacity-60 hover:opacity-80"
                      }`}
                    >
                      <div
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded border border-neutral-700 bg-cover bg-center"
                        style={{ backgroundImage: `url(${preset.bg})` }}
                      />
                      <label className="text-[10px] sm:text-xs">
                        {preset.label}
                      </label>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-sm text-[#A4A4A4] tracking-wide">
                Background
              </div>
              <div className="grid grid-cols-2 gap-4 h-[88px]">
                <button
                  onClick={() => {
                    (setBgType("default"),
                      localStorage.setItem("bgType", "default"));
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border border-[#8E8E8E]/25 shadow-[0_2px_5px_rgba(0,0,0,0.4)] transition-all ${
                    bgType === "default"
                      ? "bg-neutral-800 border-neutral-600 text-white shadow"
                      : "border-neutral-800 text-[#8E8E8E] bg-[#212020] hover:bg-neutral-900"
                  }`}
                >
                  <Broom size={26} className="mb-2" />
                  <span className="text-[13px]">Dark Mode</span>
                </button>

                <button
                  onClick={() => setBgType("local")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border border-[#8E8E8E]/25 shadow-[0_2px_5px_rgba(0,0,0,0.4)] transition-all ${
                    bgType === "local"
                      ? "bg-neutral-800 border-neutral-600 text-white shadow"
                      : "border-neutral-800 text-[#8E8E8E] bg-[#212020] hover:bg-neutral-900"
                  }`}
                >
                  <Images size={26} className="mb-2" />
                  <span className="text-xs font-medium">Local File</span>
                </button>
              </div>

              {bgType === "local" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#212020] text-[#8E8E8E] border-2 border-dashed border-neutral-700 rounded-lg p-4 sm:p-6 flex flex-col items-center justify-center text-center shadow-[0_1px_10px_rgba(0,0,0,0.4)] cursor-pointer hover:bg-neutral-900/50 hover:border-neutral-500 transition-colors group"
                  >
                    <Upload className="group-hover:text-neutral-300 mb-2 transition-colors w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm group-hover:text-neutral-200">
                      Tap to upload Image/Video
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                    />
                  </div>
                  {bgFileName && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 p-2 rounded border border-emerald-400/20">
                      <Check size={12} />{" "}
                      <span className="truncate">Selected: {bgFileName}</span>
                    </div>
                  )}
                </div>
              )}

              {(bgType === "local" || bgType === "preset") && (
                <div className="pt-2">
                  <div className="text-sm text-[#A4A4A4] tracking-wide">
                    Bg Adjustments
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center bg-[#1C1E1D] text-xs sm:text-[14px] text-[@D2D1D1] border border-[#3E3D3D] rounded-md mt-2 p-2 sm:p-2.5 px-2 sm:px-3 w-full">
                      <span className="flex-shrink-0">Blur</span>
                      <span className="ml-16 mr-2 sm:mr-3 flex-shrink-0">
                        {bgBlur}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={bgBlur}
                        onChange={(e) => setBgBlur(e.target.value)}
                        className="flex-1 h-0.5 bg-[#D9D9D9] appearance-none cursor-pointer accent-white"
                      />
                    </div>

                    <div className="flex items-center bg-[#1C1E1D] text-xs sm:text-[14px] text-[@D2D1D1] border border-[#3E3D3D] rounded-md mt-2 p-2 sm:p-2.5 px-2 sm:px-3 w-full">
                      <span className="flex-shrink-0">Brightness</span>
                      <span className="ml-5 mr-2 sm:mr-3 flex-shrink-0">
                        {bgBrightness}%
                      </span>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={bgBrightness}
                        onChange={(e) => setBgBrightness(e.target.value)}
                        className="flex-1 h-0.5 bg-[#D9D9D9] appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex border-t border-neutral-600 pt-4 gap-5"> 
              <div className="text-sm text-[#A4A4A4] tracking-wide  mb-3">
                Interface Adjustments
              </div>
              {/* <div className="flex gap-3">
                <Moon size={20}/>
                <Sun size={21}/>
              </div>*/}
            </div>

            <div className="space-y-4">
              <div>
                  <p className="text-[13px] text-[#A4A4A4]">Widget</p>
                  <div className="space-y-3">
                    {/* Logic for Blur*/}
                    {/* <div className="flex items-center bg-[#1C1E1D] text-[14px] text-[@D2D1D1] border border-[#3E3D3D] rounded-md mt-2 p-2.5 px-3 w-full">
                      <span>Blur</span>
                      <span className="ml-14 mr-3">{bgBlur}%</span>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={bgBlur}
                        onChange={(e) => setBgBlur(e.target.value)}
                        className="w-full h-0.5 bg-[#D9D9D9] appearance-none cursor-pointer accent-white"
                      />
                    </div>*/}
  
                    <div className="flex items-center bg-[#1C1E1D] text-xs sm:text-[14px] text-[@D2D1D1] border border-[#3E3D3D] rounded-md mt-2 p-2 sm:p-2.5 px-2 sm:px-3 w-full">
                      <span className="flex-shrink-0">Opacity</span>
                      <span className="ml-11 mr-2 sm:mr-3 flex-shrink-0">
                        {widgetOpacity}%
                      </span>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={widgetOpacity}
                        onChange={(e) => setWidgetOpacity(e.target.value)}
                        className="flex-1 h-0.5 bg-[#D9D9D9] appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                </div>

              {/* <div>
                <p className="text-[13px] text-[#A4A4A4]">Navbar</p>
                <div className="space-y-3">
                  <div className="flex items-center bg-[#1C1E1D] text-[14px] text-[@D2D1D1] border border-[#3E3D3D] rounded-md mt-2 p-2.5 px-3 w-full">
                    <span>Blur</span>
                    <span className="ml-14 mr-3">{bgBlur}%</span>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={bgBlur}
                      onChange={(e) => setBgBlur(e.target.value)}
                      className="w-full h-0.5 bg-[#D9D9D9] appearance-none cursor-pointer accent-white"
                    />
                  </div>

                  <div className="flex items-center bg-[#1C1E1D] text-[14px] text-[@D2D1D1] border border-[#3E3D3D] rounded-md mt-2 p-2.5 px-3 w-full">
                    <span>Opacity</span>
                    <span className="ml-14 mr-3">{widgetOpacity}%</span>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={widgetOpacity}
                      onChange={(e) => setWidgetOpacity(e.target.value)}
                      className="w-full h-0.5 bg-[#D9D9D9] appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>
              </div>*/}
            </div>
          </div>

          <div className="border-t border-neutral-600">
            <div className="flex items-center mt-3 gap-1 mb-3">
              <Database size={16} className="text-gray-400" />
              <h3 className="text-base text-white">Backup & Restore</h3>
            </div>
            <BackupManager />
          </div>

          {/* Horizontal divider Line */}
          <div className="h-0.5 w-full rounded-full bg-[#2A2A2C]"></div>

          <div className="flex justify-center gap-4">
            <button
              aria-label="Reset"
              className="w-full font-instrument px-2 py-1.5 text-black bg-neutral-300 rounded hover:bg-neutral-400 transition-colors active:scale-95"
              onClick={() => {
                navigate("/about");
                setSettingsOpen(false);
              }}
            >
              About
            </button>
            <button
              aria-label="Reset"
              className="w-full font-sans px-2 py-1.5 text-black bg-neutral-300 rounded hover:bg-neutral-400 transition-colors active:scale-95"
              onClick={() => {
                setCardDismissal(false);
                setSettingsOpen(false);
              }}
            >
              OnBoarding
            </button>
          </div>
          </div>
          
          <button
            aria-label="Reset"
            className="w-full font-instrument p-3 bg-red-600 rounded hover:bg-red-700 transition-colors"
            onClick={handleReset}
          >
            Reset
          </button>
      </div>
    </>
  );
};

export default SettingsPanel;
