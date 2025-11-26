import React, { useState, useEffect, useContext, useRef } from "react";
import { 
Menu, Plus, Search, Settings2, Pencil, X, Github, Twitter, Youtube, 
  Bot, Upload, Image as ImageIcon, FileVideo, Download, FileJson, Check
 } from "lucide-react";
import SearchBar from "../SearchBar";
import BackupManager from "./BackupManager.jsx";
import { db } from "../../services/db/schema.js";
import { SettingsContext } from "../SettingsProvider";

const PANEL_WIDTH = "360px";

const SettingsPanel = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const fileInputRef = useRef(null);
  const { 
    settingsOpen, setSettingsOpen, bgType, setBgType, handleFileUpload, bgFileName, 
    bgBlur, setBgBlur, bgBrightness, setBgBrightness, widgetOpacity, setWidgetOpacity 
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

  const handleBgType = () => {
    
  }


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
          fixed top-0 right-0 h-full bg-neutral-900 border-l border-neutral-700 z-50
          shadow-[-4px_0_20px_rgba(0,0,0,0.5)] overflow-y-auto
          transition-transform duration-300 ease-out
          ${settingsOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ width: PANEL_WIDTH }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-neutral-700 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-base font-semibold text-white">Settings</h2>
            <button
              onClick={() => setSettingsOpen(false)}
              className="text-neutral-400 hover:text-white hover:bg-neutral-800 p-1.5 rounded transition-all"
              aria-label="Close settings"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-4 py-2">
            <SearchBar 
              // value={searchQuery}
              // onChange={setSearchQuery}
              placeholder="Search"
            />
            {searchQuery && (
              <div className="mt-4 text-white">
                Searching for: {searchQuery}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
            {/* Background Media */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Appearance</h3>
                <div className="bg-neutral-800 text-xs px-2 py-0.5 rounded text-gray-400">Beta</div>
              </div>

              <div className="space-y-4">
                <div className="text-xs text-gray-400 font-medium">SOURCE</div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      setBgType('default'),
                      localStorage.setItem("bgType", "default")
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                      bgType === 'default' ? 'bg-neutral-800 border-neutral-600 text-white shadow' : 'border-neutral-800 text-gray-500 hover:bg-neutral-900'
                    }`}
                  >
                    <ImageIcon size={20} className="mb-2" />
                    <span className="text-xs font-medium">Default</span>
                  </button>

                  <button 
                    onClick={() => setBgType('local')}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                      bgType === 'local' ? 'bg-neutral-800 border-neutral-600 text-white shadow' : 'border-neutral-800 text-gray-500 hover:bg-neutral-900'
                    }`}
                  >
                    <FileVideo size={20} className="mb-2" />
                    <span className="text-xs font-medium">Local File</span>
                  </button>
                </div>

                {bgType === 'local' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-700 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-900/50 hover:border-neutral-500 transition-colors group"
                    >
                      <Upload className="text-neutral-500 group-hover:text-neutral-300 mb-2 transition-colors" size={24} />
                      <span className="text-sm text-neutral-400 group-hover:text-neutral-200">Click to upload Image/Video</span>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                    </div>
                    {bgFileName && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 p-2 rounded border border-emerald-400/20">
                        <Check size={12} /> <span className="truncate">Selected: {bgFileName}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800 space-y-4">
                  <div className="text-xs text-gray-500 font-bold mb-2">BG ADJUSTMENTS</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400"><span>Blur</span><span>{bgBlur}px</span></div>
                    <input type="range" min="0" max="20" value={bgBlur} onChange={(e) => setBgBlur(e.target.value)} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400"><span>Brightness</span><span>{bgBrightness}%</span></div>
                    <input type="range" min="10" max="200" value={bgBrightness} onChange={(e) => setBgBrightness(e.target.value)} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 pt-4 border-t border-neutral-800">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interface</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400"><span>Widget Opacity</span><span>{widgetOpacity}%</span></div>
                <input type="range" min="20" max="100" value={widgetOpacity} onChange={(e) => setWidgetOpacity(e.target.value)} className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white" />
              </div>
            </div>

          <BackupManager />

          {/* Horizontal divider Line */}
          <div className="h-0.5 w-full rounded-full bg-[#2A2A2C]"></div>

          <div className="flex justify-center">
            <button 
              aria-label="Reset"
              className="w-full font-instrument px-3 py-3 bg-red-600 rounded hover:bg-red-700 transition-colors"
              onClick={ async () => {
                if(confirm('Delete all data and reset? :)')) {
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