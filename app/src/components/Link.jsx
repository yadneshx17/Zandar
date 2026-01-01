import React, { useState, useContext } from "react";
import { db } from "../core/db/db";
import { SettingsContext } from "../contexts/SettingsProvider.jsx";
import { getPrimaryFavicon, getGoogleFavicon } from "../utils/favicon.ts";
import LinkPreview from "./LinkPreview.jsx";

import {
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Edit3,
} from "lucide-react";

export default function Link({
  sortedLinks,
  saveEditedLink,
  fetchedTitle,
  setFetchedTitle,
  isFetchingEditTitle,
  editFetchedTitle,
  showAddLink,
  isFetchingTitle,
  draggedLink,
  dragOverLink,
  editingLink,
  setDraggedLink,
  setDragOverLink,
  isHovered,
  setEditLinkData,
  editLinkData,
  setEditFetchedTitle,
  setEditingLink,
  setNewLink,
  addLink,
  newLink,
  setShowAddLink,
  deleteLink,
  widget,
  widgets
}) {
  const { widgetOpacity } = useContext(SettingsContext);
  const now = () => new Date().toISOString();

  const [isMouseDown, setIsMouseDown] = useState(null);
 
  const widgetStyle = {
    backgroundColor: `rgba(23, 23, 23, ${widgetOpacity / 100})`,
    borderColor: `rgba(38, 38, 38, ${widgetOpacity / 100})`,
  };

  // LINK DRAG & DROP HANDLERS
  const handleLinkDragStart = (e, link) => {
    setDraggedLink(link);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("linkId", link.id.toString());
  };

  const handleLinkDragEnd = () => {
    setDraggedLink(null);
    setDragOverLink(null);
  };

  const handleLinkDragOver = (e, targetLink) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedLink || draggedLink.id === targetLink.id) return;

    setDragOverLink(targetLink.id);
  };

  const handleLinkDrop = async (e, targetLink) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedLink || draggedLink.id === targetLink.id) return;

    if (draggedLink.widgetId === targetLink.widgetId) {
      // Reorder within same widget
      const widgetLinks = widget.links.sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      const draggedIndex = widgetLinks.findIndex(
        (l) => l.id === draggedLink.id,
      );
      const targetIndex = widgetLinks.findIndex((l) => l.id === targetLink.id);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const reordered = [...widgetLinks];
        const [removed] = reordered.splice(draggedIndex, 1);
        reordered.splice(targetIndex, 0, removed);

        const updates = reordered.map((link, index) =>
          db.links.update(link.id, { order: index, updatedAt: now() }),
        );

        await Promise.all(updates);
      }
    } else {
      // Move to different widget
      const targetWidgetLinks =
        widgets.find((w) => w.id === targetLink.widgetId)?.links || [];

      const targetIndex = targetWidgetLinks.findIndex(
        (l) => l.id === targetLink.id,
      );

      await db.links.update(draggedLink.id, {
        widgetId: targetLink.widgetId,
        order: targetIndex,
        updatedAt: now(),
      });
    }

    setDraggedLink(null);
    setDragOverLink(null);
  };

  return (
    <section>
      <div className="">
        {sortedLinks.map((l) => {
          const isDragging = draggedLink?.id === l.id;
          const isDropTarget = dragOverLink === l.id;
          const isEditingLink = editingLink === l.id;

          return (
            <>
              {isEditingLink ? (
                <div
                  className="bg-[#27272a] p-3 sm:p-5 rounded-lg space-y-2 mt-2"
                  style={widgetStyle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveEditedLink(l.id);
                    }
                  }}
                  // onBlur={() => isEditingLink(false)}
                >
                  <input
                    placeholder="Name"
                    className="w-full bg-[#18181b] text-white border border-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-gray-600 placeholder-gray-600"
                    style={widgetStyle}
                    value={editLinkData.name}
                    onChange={(e) => {
                      setEditLinkData({
                        ...editLinkData,
                        name: e.target.value,
                      });
                    }}
                    autoFocus
                  />
                  <input
                    placeholder="URL"
                    className="w-full bg-[#18181b] text-white border border-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-gray-600 placeholder-gray-600"
                    style={widgetStyle}
                    value={editLinkData.url}
                    onChange={(e) => {
                      const urlValue = e.target.value;
                      // When changing URL, reset name so a new title can be fetched
                      setEditLinkData({ name: "", url: urlValue });
                      setEditFetchedTitle(false);
                    }}
                  />
                  <div className="flex justify-between gap-2">
                    <button
                      disabled={
                        !editLinkData.name.trim() || !editLinkData.url.trim()
                      }
                      onClick={() => saveEditedLink(l.id)}
                      className={`flex-auto bg-white text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${
                            !editLinkData.name.trim() ||
                            !editLinkData.url.trim()
                              ? "bg-zinc-800 text-neutral-600 cursor-not-allowed"
                              : "bg-white text-black hover:bg-gray-200"
                          }
                          `}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setEditingLink(null);
                        setEditLinkData({ name: "", url: "" });
                        setEditFetchedTitle(false);
                      }}
                      className="flex-auto px-3 py-2 bg-[#18181b] text-gray-200 rounded-lg text-sm hover:bg-[#27272a] hover:text-gray-300 transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.4)]]"
                    >
                      Cancel
                    </button>
                  </div>

                  {isFetchingEditTitle && (
                    <div className="text-sm text-gray-400 mt-2">
                      Fetching title…
                    </div>
                  )}

                  <LinkPreview
                    title={editLinkData.name}
                    iconUrl={`https://www.google.com/s2/favicons?domain=${editLinkData.url}&sz=32`}
                    url={editLinkData.url}
                    isVisible={editFetchedTitle}
                    onClick={() => saveEditedLink(l.id)}
                  />
                </div>
              ) : (
                <div
                  key={l.id}
                  draggable
                  onDragStart={(e) => handleLinkDragStart(e, l)}
                  onDragEnd={handleLinkDragEnd}
                  onDragOver={(e) => handleLinkDragOver(e, l)}
                  onDrop={(e) => handleLinkDrop(e, l)}
                  className={`
                      group/link flex items-center gap-3 my-1 rounded-lg
                      hover:text-white  hover:underline cursor-move transition-all
                      text-sm
                      ${isDragging ? "opacity-30 scale-95" : "opacity-100 scale-100"}
                      ${isDropTarget ? "bg-[#27272a] p-1" : ""}
                      `}
                  onMouseDown={() => setIsMouseDown(l.id)}
                  onMouseUp={() => setIsMouseDown(null)}
                  onMouseLeave={() => setIsMouseDown(null)}
                >
                  {/* Add this as a toggle in Settings */}
                  {/* <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">*/}
                  <img
                    src={getPrimaryFavicon(l.url)}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getGoogleFavicon(l.url);
                    }}
                    className="w-4 h-4 flex-shrink-0 rounded"
                    alt=""
                  />
                  {/* </div>*/}
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 text-gray-300 hover:text-white truncate transition-all
                      ${isMouseDown === l.id && !editingLink ? "scale-[0.97] opacity-70" : "scale-100 opacity-100"}
                      `}
                  >
                    {l.name}
                  </a>

                  {/* Action button for links */}
                  <div className={`group-hover/link:opacity-100 flex gap-1`}>
                    <button
                      onClick={() => {
                        setEditingLink(l.id);
                        setEditLinkData({ name: l.name, url: l.url });
                      }}
                      className="opacity-0 group-hover/link:opacity-100 text-gray-500 hover:text-white p-1 rounded transition-all"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => deleteLink(l.id)}
                      className="opacity-0 group-hover/link:opacity-100 text-gray-500 hover:text-red-400 p-1 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })}

        {showAddLink ? (
          <div
            className="bg-[#27272a] p-3 rounded-lg space-y-2 mt-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addLink(widget.id);
              }
            }}
            style={widgetStyle}
            // onBlur={() => setShowAddLink(false)}
          >
            <input
              placeholder="Auto-fetched title"
              className="w-full bg-[#18181b] text-white border border-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-gray-600 placeholder-gray-600"
              value={newLink.name}
              onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
            />
            <input
              placeholder="Paste a link to auto-fetch title"
              className="w-full bg-[#18181b] text-white border border-gray-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-gray-600 placeholder-gray-600"
              value={newLink.url}
              onChange={(e) => {
                const urlValue = e.target.value;
                // When changing URL, reset name so a new title can be fetched
                setNewLink({ name: "", url: urlValue });
                setFetchedTitle(false);
              }}
              autoFocus
            />

            {isFetchingTitle && (
              <div className="text-sm text-gray-400">Fetching title…</div>
            )}

            <div className="flex justify-between gap-2">
              <button
                disabled={!newLink.url || !newLink.name}
                onClick={() => addLink(widget.id)}
                className={`flex-auto bg-white text-black px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !newLink.url || !newLink.name
                    ? "bg-zinc-800 text-neutral-600 cursor-not-allowed"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                Add
              </button>

              <button
                onClick={() => {
                  setShowAddLink(false);
                  setNewLink({ name: "", url: "" });
                  setFetchedTitle(false);
                }}
                className="flex-auto px-3 py-2 bg-[#18181b] text-gray-400 rounded-lg text-sm hover:bg-[#27272a] hover:text-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            <LinkPreview
              title={newLink.name}
              url={newLink.url}
              isVisible={fetchedTitle}
              onClick={() => addLink(widget.id)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowAddLink(true)}
            className={`w-full text-left text-xs text-neutral-500 py-2 rounded-lg opacity-0 ${isHovered ? "opacity-100" : ""} hover:text-white/75 flex items-center gap-2 mt-1 transition-all`}
          >
            <Plus size={14} /> Add link
          </button>
        )}
      </div>
    </section>
  );
}
