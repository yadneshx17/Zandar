import React, { useState, useEffect } from "react";
import { 
  X,
  Search

 } from "lucide-react";
import SearchBar from "../SearchBar";
import BackupManager from "../BackupManager";

const PANEL_WIDTH = "400px";

const SettingsPanel = ({ isOpen, onClose }) => {
  
  // const [searchQuery, setSearchQuery] = useState("");

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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Settings Panel - Slides from RIGHT */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-neutral-900 border-l border-neutral-700 z-50
          shadow-[-4px_0_20px_rgba(0,0,0,0.5)] overflow-y-auto
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ width: PANEL_WIDTH }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-neutral-700 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-base font-semibold text-white">Settings</h2>
            <button
              onClick={onClose}
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
{/*             
            {searchQuery && (
              <div className="mt-4 text-white">
                Searching for: {searchQuery}
              </div>
            )} */}
          </div>

        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          <BackupManager />

        </div>
      </div>
    </>
  );
};

export default SettingsPanel;