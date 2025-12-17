import React from "react";



const LinkPreview = ({ title, iconUrl, url, isVisible, onClick }) => {
  if (!isVisible) {
    return null;
  }

  // Sanitize and shorten the URL for display
  const displayUrl = url
    ? url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]
    : "No URL";

  return (
    <div
      className="mt-3 bg-white rounded-lg shadow-md p-3 w-full border border-gray-200 text-gray-800 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center min-w-0">
          {iconUrl && (
            <img
              src={iconUrl}
              alt="Link Icon"
              className="w-8 h-8 mr-2 flex-shrink-0"
              onError={(e) => {
                // Hide the broken image
                e.target.style.display = "none";
              }}
            />
          )}
          <span className="text-sm font-semibold truncate">
            {title || "No Title"}
          </span>
        </div>
        <div className="text-sm font-sans text-gray-500 truncate max-w-[45%] text-right">
          {displayUrl}
        </div>
      </div>
    </div>
  );
};

export default LinkPreview;
