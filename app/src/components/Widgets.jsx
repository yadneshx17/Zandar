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
import { db } from "../core/db/db";
import { SettingsContext } from "../contexts/SettingsProvider.jsx";
import { WidgetDeleteConfirm } from "./WidgetDeleteConfirm";
import { deleteWidget, updateWidgetTitle } from "../core/db/widget";
import Link from "./Link";

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
  
  const getDomain = (url) => {
    try {
      const safeUrl = url.startsWith("http") ? url : `https://${url}`;
      const hostname = new URL(safeUrl).hostname;
      return hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  };

  // useEffect(() => {
  //   if (!newLink.url) {
  //     setFetchedTitle(false);
  //     return;
  //   }

  //   const controller = new AbortController();

  //   const timeout = setTimeout(async () => {
  //     try {
  //       setIsFetchingTitle(true);

  //       // backend endpoint (recommended)
  //       const res = await fetch(`${API_BASE}/api/preview`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ url: normalizeURL(newLink.url) }),
  //         signal: controller.signal,
  //       });

  //       const data = await res.json();

  //       // only autofill if user hasn't typed name/title
  //       if (data.title && !newLink.name) {
  //         setNewLink((prev) => ({
  //           ...prev,
  //           name: data.title,
  //         }));
  //       }

  //       // show preview as long as we have a URL and got a response
  //       setFetchedTitle(Boolean(data.title || newLink.url));
  //     } catch (e) {
  //       if (e.name !== "AbortError") {
  //         console.error("Preview error", e);
  //       }
  //       setFetchedTitle(false);
  //     } finally {
  //       setIsFetchingTitle(false);
  //     }
  //   }, 600); // debounce

  //   return () => {
  //     clearTimeout(timeout);
  //     controller.abort();
  //   };
  // }, [newLink.url]);
  
  // Inside useEffect in Widgets.jsx
  // Auto-fetch for NEW links
  useEffect(() => {
    // 1. Exit if no URL
    if (!newLink.url) {
      setFetchedTitle(false);
      return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      try {
        setIsFetchingTitle(true);
  
        // 2. The Fetch Call (Restored)
        const res = await fetch(`${API_BASE}/api/preview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizeURL(newLink.url) }),
          signal: controller.signal,
        });
  
        const data = await res.json();
  
        // 3. The Smart Logic
        if (data.title) {
          setNewLink((prev) => {
            // Re-calculate domain of the CURRENT url in state
            const currentDomain = getDomain(prev.url);
  
            // Overwrite ONLY if name is empty OR matches the domain placeholder
            if (!prev.name || prev.name === currentDomain) {
              return { ...prev, name: data.title };
            }
            return prev; // User typed a custom name, keep it
          });
        }
  
        setFetchedTitle(Boolean(data.title));
      } catch (e) {
        if (e.name !== "AbortError") console.error("Preview error", e);
        setFetchedTitle(false);
      } finally {
        setIsFetchingTitle(false);
      }
    }, 600);
  
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [newLink.url]); // Dependency on URL ensures this runs when input changes
  
  // Editing
  // Auto-fetch preview title for edited links
  // useEffect(() => {
  //   if (!editingLink) return;
  //   if (!editLinkData.url) {
  //     setEditFetchedTitle(false);
  //     return;
  //   }

  //   const controller = new AbortController();

  //   const timeout = setTimeout(async () => {
  //     try {
  //       setIsFetchingEditTitle(true);

  //       const res = await fetch(`${API_BASE}/api/preview`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ url: normalizeURL(editLinkData.url) }),
  //         signal: controller.signal,
  //       });

  //       const data = await res.json();

  //       // only autofill if user hasn't typed name/title
  //       if (data.title && !editLinkData.name) {
  //         setEditLinkData((prev) => ({
  //           ...prev,
  //           name: data.title,
  //         }));
  //       }

  //       setEditFetchedTitle(Boolean(data.title || editLinkData.url));
  //     } catch (e) {
  //       if (e.name !== "AbortError") {
  //         console.error("Preview error (edit)", e);
  //       }
  //       setEditFetchedTitle(false);
  //     } finally {
  //       setIsFetchingEditTitle(false);
  //     }
  //   }, 600);

  //   return () => {
  //     clearTimeout(timeout);
  //     controller.abort();
  //   };
  // }, [editLinkData.url, editingLink]);

  
  // Auto-fetch for EDITED links
  useEffect(() => {
    if (!editingLink) return;
    
    // Exit if URL is cleared
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
  
        // ✅ Updated to use the same Smart Logic as above
        if (data.title) {
          setEditLinkData((prev) => {
            const currentDomain = getDomain(prev.url);
  
            // If the title is empty OR matches the domain (placeholder), update it
            if (!prev.name || prev.name === currentDomain) {
              return { ...prev, name: data.title };
            }
            return prev;
          });
        }
  
        setEditFetchedTitle(Boolean(data.title || editLinkData.url));
      } catch (e) {
        if (e.name !== "AbortError") console.error("Preview error (edit)", e);
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
  
  const deleteLink = (id) =>
    showConfirmDialog("Delete Link", "This cannot be undone", () => {
      db.links.delete(id);
    });

  // Delete Widget + all its links
  const handleDeleteWidget = (widgetId) =>
    showConfirmDialog(
      "Delete Widget",
      "This will delete all links too",
      async () => {
        await deleteWidget(widgetId);
      },
    );

  // Toggle Collapse
  const toggleCollapse = (id, collapsed) => {
    db.widgets.update(id, { collapsed: !collapsed, updatedAt: now() });
  };

  // Update Widget Title
  const handleWidgetTitleUpdate = async (id, title) => {
    await updateWidgetTitle(id, title);
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
      {confirmDialog.show && (
        <WidgetDeleteConfirm
          confirmDialog={confirmDialog}
          closeConfirm={closeConfirm}
          handleConfirm={handleConfirm}
        />
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
                    handleWidgetTitleUpdate(widget.id, w.title);
                  }
                  setEditingWidgetTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const w = widgets.find((x) => x.id === widget.id);
                    if (w) {
                      handleWidgetTitleUpdate(widget.id, w.title);
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
              onClick={() => handleDeleteWidget(widget.id)}
              className="text-gray-400 hover:text-red-400 hover:bg-[#27272a] p-1.5 rounded transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Links */}
        {/* Widget Content ( Links ) */}
        {!widget.collapsed && (
          <Link
            sortedLinks={sortedLinks}
            saveEditedLink={saveEditedLink}
            fetchedTitle={fetchedTitle}
            setFetchedTitle={setFetchedTitle}
            isFetchingEditTitle={isFetchingEditTitle}
            editFetchedTitle={editFetchedTitle}
            showAddLink={showAddLink}
            isFetchingTitle={isFetchingTitle}
            draggedLink={draggedLink}
            dragOverLink={dragOverLink}
            editingLink={editingLink}
            setDraggedLink={setDraggedLink}
            setDragOverLink={setDragOverLink}
            isHovered={isHovered}
            setEditLinkData={setEditLinkData}
            editLinkData={editLinkData}
            setEditFetchedTitle={setEditFetchedTitle}
            setEditingLink={setEditingLink}
            setNewLink={setNewLink}
            addLink={addLink}
            newLink={newLink}
            setShowAddLink={setShowAddLink}
            deleteLink={deleteLink}
            widget={widget}
            widgets={widgets}
            getDomain={getDomain}
          />
        )}
      </div>
    </>
  );
};

export default Widget;
