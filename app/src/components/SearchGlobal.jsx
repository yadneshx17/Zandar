import React, { useRef, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { db } from "../services/db/schema.js";
import { useLiveQuery } from "dexie-react-hooks";
import { Command } from "lucide-react";

export default function SearchGlobal({ setSearchOpen }) {
  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const resultsRef = useRef(null);

  // Get all links from database
  const allLinks = useLiveQuery(() => db.links.toArray(), []);

  // Filter links based on search query
  const filteredLinks = React.useMemo(() => {
    if (!allLinks || !searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    return allLinks.filter((link) => {
      const nameMatch = link.name?.toLowerCase().includes(query);
      const urlMatch = link.url?.toLowerCase().includes(query);
      return nameMatch || urlMatch;
    });
  }, [allLinks, searchQuery]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredLinks.length]);

  // Auto-focus input on mount and trigger animation
  useEffect(() => {
    inputRef.current?.focus();
    // Trigger animation after a tiny delay
    requestAnimationFrame(() => {
      setIsMounted(true);
    });
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredLinks.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && filteredLinks.length > 0) {
        e.preventDefault();
        const selectedLink = filteredLinks[selectedIndex];
        if (selectedLink) {
          window.open(selectedLink.url, "_blank", "noopener,noreferrer");
          setSearchOpen(false);
          setSearchQuery("");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredLinks, selectedIndex, setSearchOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  const handleLinkClick = (link) => {
    window.open(link.url, "_blank", "noopener,noreferrer");
    setSearchOpen(false);
    setSearchQuery("");
  };

  const getFaviconUrl = (url) => {
    try {
      // Normalize URL - add https:// if missing
      let normalizedUrl = url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        normalizedUrl = `https://${url}`;
      }
      const domain = new URL(normalizedUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      // Fallback: try to extract domain from string
      const domainMatch = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
      const domain = domainMatch ? domainMatch[1] : url;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center pt-16 sm:pt-28 z-50 transition-opacity duration-200 px-4 ${
        isMounted ? "opacity-100" : "opacity-0"
      }`}
      onClick={() => {
        setSearchOpen(false);
        setSearchQuery("");
      }}
    >
      {/* Search Bar*/}
      <div
        className={`bg-[#161616] border border-white/20 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] w-full max-w-2xl transform transition-all duration-200 ${
          isMounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-gray-700 ">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search bookmarks by name or URL…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white outline-none text-sm sm:text-lg placeholder-neutral-500"
          />

          {/* <button
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>*/}

          <div className="hidden sm:flex items-center gap-0.5 bg-[#808080] text-black shadow-[0_2px_1px_rgba(0,0,0,0.5),0_1px_5px_rgba(0,0,0,0.4)] px-1.5 rounded-md">
            <Command size={13} /> K
          </div>
        </div>
      </div>

      {/* Results Secction*/}
      <div
        className={`bg-[#161616] w-full max-w-2xl transform transition-all duration-200 mt-2 rounded-lg max-h-[60vh] sm:max-h-96 overflow-y-auto`}
      >
        {searchQuery.trim() && filteredLinks.length > 0 && (
          <div className="p-2">
            {/* Section Header */}
            {/* add when more search types */}
            {/* <div className="px-3 py-2 text-sm font-sans text-neutral-300">
              Bookmarks
            </div>*/}

            {/* Results List */}
            <div ref={resultsRef} className="space-y-1 pb-1">
              {filteredLinks.map((link, index) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all text-left group ${
                    selectedIndex === index
                      ? "bg-[#27272a] text-white"
                      : "text-gray-300 hover:bg-[#222222] hover:text-white"
                  }`}
                >
                  <img
                    src={getFaviconUrl(link.url)}
                    className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 rounded"
                    alt=""
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs sm:text-sm truncate">
                      {link.name || "Untitled"}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5">
                      {link.url}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchQuery.trim() && filteredLinks.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-sm">
              No matching bookmarks found
            </div>
          </div>
        )}

        {/* Initial State - No Query */}
        {/* {searchQuery.trim() && (
          <div className="p-8 text-center">
            <div className="text-neutral-400 text-base">
              Start typing to search your bookmarks...
            </div>
          </div>
        )}*/}
      </div>
    </div>
  );
}
