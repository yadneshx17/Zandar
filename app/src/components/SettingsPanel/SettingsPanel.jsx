import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Menu,
  Plus,
  Search,
  Settings2,
  Pencil,
  X,
  Github,
  Database,
  Images,
  Twitter,
  Youtube,
  Bot,
  Upload,
  Image as ImageIcon,
  FileVideo,
  Download,
  FileJson,
  Check,
  LucideOctagonAlert,
} from "lucide-react";
import SearchBar from "../SearchBar";
import BackupManager from "./BackupManager.jsx";
import { db } from "../../services/db/schema.js";
import { SettingsContext } from "../../contexts/SettingsProvider";
import { Broom } from "@phosphor-icons/react";

const PANEL_WIDTH = "360px";

const SettingsPanel = ({ isOpen, onClose }) => {
  // const [searchQuery, setSearchQuery] = useState("");

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
  } = useContext(SettingsContext);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {settingsOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 animate-in fade-in duration-200"
          onClick={() => setSettingsOpen(false)}
        />
      )}

      {/* Settings Panel - Slides from RIGHT */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-[#1A1A1A] border-l border-neutral-700 z-50
          shadow-[-4px_0_20 px_rgba(0,0,0,0.5)] overflow-hidden
          transition-transform duration-300 ease-out flex flex-col
          ${settingsOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ width: PANEL_WIDTH }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#161616] border-b border-neutral-700 z-20">          <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center justify-between py-1 w-full">
                <h2 className="text-lg text-white font-medium tracking-wide">Settings</h2>
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
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Background Media */}
          <div>
            <div className="flex items-center mb-1">
              <h3 className="text-base text-white">Appearance</h3>
            </div>

            <div className="space-y-4 pt-4">
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
                  <span className="text-[13px]">Default</span>
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
                <>
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#212020] text-[#8E8E8E] border-2 border-dashed border-neutral-700 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-[0_1px_10px_rgba(0,0,0,0.4)] cursor-pointer hover:bg-neutral-900/50 hover:border-neutral-500 transition-colors group"
                    >
                      <Upload
                        className="group-hover:text-neutral-300 mb-2 transition-colors"
                        size={24}
                      />
                      <span className="text-sm  group-hover:text-neutral-200">
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

                  <div className="pt-2">
                    <div className="text-sm text-[#A4A4A4] tracking-wide">
                      Bg Adjustments
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center bg-[#1C1E1D] text-[14px] text-[@D2D1D1] border border-[#3E3D3D] rounded-md mt-2 p-2.5 px-3 w-[325px]">
                        <span>Blur</span>
                        <span className="ml-16 mr-3">{bgBlur}%</span>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={bgBlur}
                          onChange={(e) => setBgBlur(e.target.value)}
                          className="w-full h-0.5 bg-[#D9D9D9] appearance-none cursor-pointer accent-white"
                        />
                      </div>

                      <div className="flex items-center bg-[#1C1E1D] text-[14px] text-[@D2D1D1] border border-[#3E3D3D] rounded-md mt-2 p-2.5 px-3 w-[325px]">
                        <span>Brightness</span>
                        <span className="ml-5 mr-3">{bgBrightness}%</span>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          value={bgBrightness}
                          onChange={(e) => setBgBrightness(e.target.value)}
                          className="w-full h-0.5 bg-[#D9D9D9] appearance-none cursor-pointer accent-white"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-[#A4A4A4] tracking-wide border-t border-neutral-600 pt-4 mb-3">
              Interface Adjustments
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
    
                  <div className="flex items-center bg-[#1C1E1D] text-[14px] text-[@D2D1D1] border border-[#3E3D3D] rounded-md mt-2 p-2.5 px-3 w-[325px]">
                    <span>Opacity</span>
                    <span className="ml-11 mr-3">{widgetOpacity}%</span>
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

          <div className="flex justify-center">
            <button
              aria-label="Reset"
              className="w-full font-instrument px-3 py-3 bg-red-600 rounded hover:bg-red-700 transition-colors"
              onClick={async () => {
                if (confirm("Delete all data and reset? :)")) {
                  await db.delete();
                  window.location.reload();
                }
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
