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
      <div className="absolute left-3 pointer-events-none">
        <Search size={16} className="text-gray-500" />
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
          text-white text-sm
          pl-10 pr-20 py-2
          focus:outline-none
          placeholder-gray-500
        "
      />

      {/* Keyboard Shortcut Hint */}
      <div className="absolute right-3 pointer-events-none">
        <kbd className="
          px-2 py-0.5
          text-xs
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