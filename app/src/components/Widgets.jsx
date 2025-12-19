import React, { useState, useContext, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Edit3,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../services/db/schema.js";
import { SettingsContext } from "../contexts/SettingsProvider.jsx";
import LinkPreview from "./LinkPreview.jsx";

const Widget = ({ widget, widgets, setWidgets }) => {
  const [showAddLink, setShowAddLink] = useState(false);
  const [editingWidgetTitle, setEditingWidgetTitle] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [editingLink, setEditingLink] = useState(null);
  const [editLinkData, setEditLinkData] = useState({ name: "", url: "" });
  const [newLink, setNewLink] = useState({ name: "", url: "" });
  const [fetchedTitle, setFetchedTitle] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [editFetchedTitle, setEditFetchedTitle] = useState(false);
  const [isFetchingEditTitle, setIsFetchingEditTitle] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [draggedLink, setDraggedLink] = useState(null);
  const [dragOverLink, setDragOverLink] = useState(null);
  const [isMouseDown, setIsMouseDown] = useState(null);

  const now = () => new Date().toISOString();

  const API_BASE = import.meta.env.VITE_BACKEND_API_URL;

  const { widgetOpacity } = useContext(SettingsContext);

  function normalizeURL(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  }

  const saveEditedLink = async (id) => {
    await db.links.update(id, {
      name: editLinkData.name,
      url: normalizeURL(editLinkData.url),
      updatedAt: now(),
    });

    setEditingLink(null);
    setEditLinkData({ name: "", url: "" });
  };

  const widgetStyle = {
    backgroundColor: `rgba(23, 23, 23, ${widgetOpacity / 100})`,
    borderColor: `rgba(38, 38, 38, ${widgetOpacity / 100})`,
  };

  const showConfirmDialog = (title, message, onConfirm) =>
    setConfirmDialog({ show: true, title, message, onConfirm });

  const handleConfirm = () => {
    confirmDialog.onConfirm?.();
    closeConfirm();
  };

  const closeConfirm = () =>
    setConfirmDialog({ show: false, title: "", message: "", onConfirm: null });

  // Add Link
  const addLink = async (widgetId) => {
    // handleUrlPaste(newLink.url);

    // if (!newLink.name.trim() || !newLink.url.trim()) {
    if (!newLink.url.trim()) {
      // alert("Please fill in name & URL");
      return;
    }

    let url = normalizeURL(newLink.url.trim());

    const maxOrder =
      widget.links.length > 0
        ? Math.max(...widget.links.map((l) => l.order || 0))
        : -1;

    try {
      await db.links.add({
        uuid: uuidv4(),
        name: newLink.name,
        url,
        widgetId,
        order: maxOrder + 1,
        createdAt: now(),
        updatedAt: now(),
      });
    } catch (e) {
      console.error("Failed to add link:", e);
    }

    setNewLink({ name: "", url: "" });
    setShowAddLink(false);
  };

  useEffect(() => {
    if (!newLink.url) {
      setFetchedTitle(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setIsFetchingTitle(true);

        // backend endpoint (recommended)
        const res = await fetch(`${API_BASE}/api/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizeURL(newLink.url) }),
          signal: controller.signal,
        });

        const data = await res.json();

        // only autofill if user hasn't typed name/title
        if (data.title && !newLink.name) {
          setNewLink((prev) => ({
            ...prev,
            name: data.title,
          }));
        }

        // show preview as long as we have a URL and got a response
        setFetchedTitle(Boolean(data.title || newLink.url));
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Preview error", e);
        }
        setFetchedTitle(false);
      } finally {
        setIsFetchingTitle(false);
      }
    }, 600); // debounce

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [newLink.url]);

  // Auto-fetch preview title for edited links
  useEffect(() => {
    if (!editingLink) return;
    if (!editLinkData.url) {
      setEditFetchedTitle(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setIsFetchingEditTitle(true);

        const res = await fetch(`${API_BASE}/api/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizeURL(editLinkData.url) }),
          signal: controller.signal,
        });

        const data = await res.json();

        // only autofill if user hasn't typed name/title
        if (data.title && !editLinkData.name) {
          setEditLinkData((prev) => ({
            ...prev,
            name: data.title,
          }));
        }

        setEditFetchedTitle(Boolean(data.title || editLinkData.url));
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Preview error (edit)", e);
        }
        setEditFetchedTitle(false);
      } finally {
        setIsFetchingEditTitle(false);
      }
    }, 600);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [editLinkData.url, editingLink]);

  // Delete Link
  const deleteLink = (id) =>
    showConfirmDialog("Delete Link", "This cannot be undone", () => {
      db.links.delete(id);
    });

  // Delete Widget + all its links
  const deleteWidget = (widgetId) =>
    showConfirmDialog(
      "Delete Widget",
      "This will delete all links too",
      async () => {
        const links = await db.links.where({ widgetId }).toArray();
        await Promise.all(links.map((l) => db.links.delete(l.id)));
        await db.widgets.delete(widgetId);
      },
    );

  // Toggle Collapse
  const toggleCollapse = (id, collapsed) => {
    db.widgets.update(id, { collapsed: !collapsed, updatedAt: now() });
  };

  // Update Widget Title
  const updateWidgetTitle = (id, title) => {
    const trimmedTitle = title.trim();
    if (trimmedTitle === "") {
      db.widgets.update(id, { title: "New Widget", updatedAt: now() });
    } else {
      db.widgets.update(id, { title: trimmedTitle, updatedAt: now() });
    }
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

  // Drop on widget (when not dropping on a specific link)
  const handleWidgetDrop = async (e) => {
    e.preventDefault();

    if (!draggedLink || dragOverLink) return;

    if (draggedLink.widgetId !== widget.id) {
      const maxOrder =
        widget.links.length > 0
          ? Math.max(...widget.links.map((l) => l.order || 0))
          : -1;

      await db.links.update(draggedLink.id, {
        widgetId: widget.id,
        order: maxOrder + 1,
        updatedAt: now(),
      });
    }

    setDraggedLink(null);
  };

  // Sort links by order
  const sortedLinks = [...widget.links].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );

  return (
    <>
      {/* Confirm Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-gray-800 rounded-xl p-4 sm:p-6 shadow-2xl w-full max-w-sm">
            <div className="flex gap-3 items-center text-red-400 mb-4">
              <AlertTriangle size={20} />
              <span className="font-semibold text-lg">
                {confirmDialog.title}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              {confirmDialog.message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 text-sm bg-[#27272a] text-gray-300 rounded-lg hover:bg-[#3f3f46] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Container */}
      <div
        className="bg-[#161616] rounded-xl p-3 sm:p-5 transition-all font-instrument shadow-[0_4px_15px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleWidgetDrop}
        style={widgetStyle}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3 sm:mb-4 gap-2">
          <div className="flex gap-2 items-center flex-1">
            {editingWidgetTitle ? (
              <input
                value={widget.title}
                onChange={(e) =>
                  setWidgets((prev) =>
                    prev.map((x) =>
                      x.id === widget.id ? { ...x, title: e.target.value } : x,
                    ),
                  )
                }
                onBlur={() => {
                  const w = widgets.find((x) => x.id === widget.id);
                  if (w) {
                    updateWidgetTitle(widget.id, w.title);
                  }
                  setEditingWidgetTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const w = widgets.find((x) => x.id === widget.id);
                    if (w) {
                      updateWidgetTitle(widget.id, w.title);
                    }
                    setEditingWidgetTitle(false);
                  }
                  if (e.key === "Escape") {
                    setEditingWidgetTitle(false);
                  }
                }}
                autoFocus
                className="flex-1 mr-2 sm:mr-6 bg-[#27272a] text-white text-sm sm:text-base font-medium px-2 sm:px-3 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#767676]/50"
              />
            ) : (
              <button
                onClick={() => toggleCollapse(widget.id, widget.collapsed)}
                className="flex items-center gap-2 flex-1 text-left group/title min-w-0"
              >
                <h3
                  className="text-sm sm:text-base font-medium text-white group-hover/title:text-gray-200 truncate"
                  onDoubleClick={() => setEditingWidgetTitle(true)}
                >
                  {widget.title}
                </h3>
                <ChevronDown
                  size={16}
                  className={`sm:w-[18px] sm:h-[18px] flex-shrink-0 transition-transform ${widget.collapsed ? "-rotate-90 text-gray-400" : "+rotate-90 text-gray-400"} ${isHovered ? "opacity-100" : "opacity-0"} `}
                />
              </button>
            )}
          </div>

          {/* Widget Actions */}
          <div
            className={`flex gap-1 transition-opacity duration-200 flex-shrink-0 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <button
              onClick={() => setEditingWidgetTitle(true)}
              className="text-gray-400 hover:text-white hover:bg-[#27272a] p-1.5 rounded transition-colors"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => deleteWidget(widget.id)}
              className="text-gray-400 hover:text-red-400 hover:bg-[#27272a] p-1.5 rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Links */}
        {/* Widget Content ( Links ) */}
        {!widget.collapsed && (
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
                            !editLinkData.name.trim() ||
                            !editLinkData.url.trim()
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
                        src={`https://www.google.com/s2/favicons?domain=${l.url}&sz=32`}
                        className="w-4 h-4 flex-shrink-0 rounded"
                        alt=""
                        onError={(e) => (e.target.style.display = "none")}
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
                      <div
                        className={`group-hover/link:opacity-100 flex gap-1`}
                      >
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
                  onChange={(e) =>
                    setNewLink({ ...newLink, name: e.target.value })
                  }
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
                  iconUrl={`https://www.google.com/s2/favicons?domain=${newLink.url}&sz=32`}
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
        )}
      </div>
    </>
  );
};

export default Widget;
