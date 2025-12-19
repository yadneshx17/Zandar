import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search",
  autoFocus = false 
}) => {
  const inputRef = useRef(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="
      relative
      flex items-center
      bg-[#1a1a1a]
      border border-neutral-700
      hover:border-neutral-600
      focus-within:border-neutral-600
      rounded-lg
      transition-all
      group
    ">
      {/* Search Icon */}
      <div className="absolute left-2 sm:left-3 pointer-events-none">
        <Search size={14} className="sm:w-4 sm:h-4 text-gray-500" />
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="
          w-full
          bg-transparent
          text-white text-xs sm:text-sm
          pl-8 sm:pl-10 pr-16 sm:pr-20 py-1.5 sm:py-2
          focus:outline-none
          placeholder-gray-500
        "
      />

      {/* Keyboard Shortcut Hint */}
      <div className="absolute right-2 sm:right-3 pointer-events-none hidden sm:block">
        <kbd className="
          px-1.5 sm:px-2 py-0.5
          text-[10px] sm:text-xs
          text-gray-500
          bg-[#0e0e0e]
          border border-gray-800
          rounded
          font-mono
        ">
          Ctrl+K
        </kbd>
      </div>
    </div>
  );
};

export default SearchBar;