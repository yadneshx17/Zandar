import React, { useState, useEffect, useCallback, useContext } from "react";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../core/db/db";
import Widget from "./Widgets";
import { SettingsContext } from "../contexts/SettingsProvider";
import NavBar from "./Navbar.jsx";

const Dashboard = ({
  activePage = "c9f9bcf-2a55-4784-8a9b-637cbe8efba0",
  setActivePage,
}) => {
  const dbPages = useLiveQuery(() => db.pages.toArray(), []);
  const dbWidgets = useLiveQuery(() => db.widgets.toArray(), []);
  const dbLinks = useLiveQuery(() => db.links.toArray(), []);

  const [widgets, setWidgets] = useState([]);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [dragOverWidget, setDragOverWidget] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dropPosition, setDropPosition] = useState(null);

  const { widgetOpacity } = useContext(SettingsContext);

  const now = () => new Date().toISOString();

  const getCurrentPageId = useCallback(() => {
    if (!dbPages || !activePage) return null;
    const page = dbPages.find((p) => p.uuid === activePage);
    return page ? page.id : null;
  }, [dbPages, activePage]);

  // Optimise this.
  useEffect(() => {
    if (dbWidgets && dbLinks && dbPages) {
      const currentPageId = getCurrentPageId();

      if (!currentPageId) {
        setWidgets([]);
        return;
      }

      const widgetsForCurrentPage = dbWidgets.filter(
        (widget) => widget.pageId === currentPageId,
      );

      // O(M x N)
      const data = widgetsForCurrentPage.map((widget) => ({
        ...widget,
        links: dbLinks.filter((link) => link.widgetId === widget.id),
      }));

      setWidgets(data);
    }
  }, [dbWidgets, dbLinks, dbPages, activePage, getCurrentPageId]);

  const getWidgetsByColumn = (columnId) => {
    return widgets
      .filter((widget) => (widget.columnId || 1) === columnId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const addWidget = async (columnId) => {
    const currentPageId = getCurrentPageId();

    if (!currentPageId) {
      alert("Please select a page first");
      return;
    }

    const columnWidgets = getWidgetsByColumn(columnId);
    const maxOrder =
      columnWidgets.length > 0
        ? Math.max(...columnWidgets.map((w) => w.order || 0))
        : -1;

    await db.widgets.add({
      uuid: uuidv4(),
      title: "New Widget",
      collapsed: false,
      pageId: currentPageId,
      columnId: columnId || 1,
      order: maxOrder + 1,
      createdAt: now(),
      updatedAt: now(),
    });
  };

  useEffect(() => {
    const handleBridgeMessage = async (event) => {
      if (event.source !== window) return;

      if (event.data.type === "ZANDAR_INGEST_LINKS") {
        const links = event.data.payload;
        console.log("📥 Receiving offline links:", links);

        try {
          for (const link of links) {
            await saveExtensionLink(1, link.title, link.url);
          }

          // Confirm success to clear the queue
          window.postMessage({ type: "ZANDAR_CLEAR_QUEUE" }, "*");
        } catch (error) {
          console.error("Failed to Save the Link", error);
        }
      }
    };

    window.addEventListener("message", handleBridgeMessage);

    console.log("Zandar Dashboard ready. Pinging Bridge...");

    const timerId = setTimeout(() => {
      window.postMessage({ type: "ZANDAR_APP_READY" }, "*");
    }, 1000);

    // cleanup 
    return () => {
      window.removeEventListener("message", handleBridgeMessage);
      clearTimeout(timerId);
    };
  }, []); 

  async function saveExtensionLink(defaultWidgetId, title, url) {
    await db.links.add({
      uuid: uuidv4(),
      name: title,
      url: url,
      widgetId: defaultWidgetId,
      createdAt: now(),
      updatedAt: now(),
    });

    console.log("Saved Link in DB!");
  }

  // DRAG & DROP HANDLERS
  const handleWidgetDragStart = (e, widget) => {
    setDraggedWidget(widget);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("widgetId", widget.id.toString());
  };

  const handleWidgetDragEnd = () => {
    setDraggedWidget(null);
    setDragOverWidget(null);
    setDragOverColumn(null);
    setDropPosition(null);
  };

  const handleColumnDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleWidgetDragOver = (e, targetWidget) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedWidget || draggedWidget.id === targetWidget.id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const widgetMiddle = rect.top + rect.height / 2;
    const position = mouseY < widgetMiddle ? "above" : "below";

    setDragOverWidget(targetWidget.id);
    setDropPosition(position);
  };

  const handleWidgetDrop = async (e, targetWidget) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedWidget || draggedWidget.id === targetWidget.id) return;

    const targetColumnId = targetWidget.columnId;
    const columnWidgets = getWidgetsByColumn(targetColumnId);

    const filteredWidgets = columnWidgets.filter(
      (w) => w.id !== draggedWidget.id,
    );
    const targetIndex = filteredWidgets.findIndex(
      (w) => w.id === targetWidget.id,
    );
    const newIndex = dropPosition === "above" ? targetIndex : targetIndex + 1;
    filteredWidgets.splice(newIndex, 0, draggedWidget);

    const updates = filteredWidgets.map((widget, index) => {
      return db.widgets.update(widget.id, {
        columnId: targetColumnId,
        order: index,
        updatedAt: now(),
      });
    });

    await Promise.all(updates);

    setDraggedWidget(null);
    setDragOverWidget(null);
    setDragOverColumn(null);
    setDropPosition(null);
  };

  const handleColumnDrop = async (e, targetColumnId) => {
    e.preventDefault();

    if (!draggedWidget) return;

    if (!dragOverWidget) {
      const columnWidgets = getWidgetsByColumn(targetColumnId);
      const maxOrder =
        columnWidgets.length > 0
          ? Math.max(...columnWidgets.map((w) => w.order || 0))
          : -1;

      await db.widgets.update(draggedWidget.id, {
        columnId: targetColumnId,
        order: maxOrder + 1,
        updatedAt: now(),
      });
    }

    setDraggedWidget(null);
    setDragOverWidget(null);
    setDragOverColumn(null);
    setDropPosition(null);
  };

  if (!dbPages) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar activeTab={activePage} setActiveTab={setActivePage} />
      <div className="h-full overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 custom-scroll">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-full mx-auto">
          {widgets.length === 0 ? (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-12 sm:py-24">
              <button
                onClick={() => addWidget(1)}
                style={{
                  backgroundColor: `rgba(10, 10, 10, ${Math.max(0.8, widgetOpacity / 100)})`,
                }}
                className="group relative flex flex-col items-center gap-3 px-8 sm:px-12 py-8 sm:py-10 w-full max-w-md
                hover:bg-[#1c1c1f]
                border-2 border-dashed border-zinc-700
                hover:border-zinc-700
                hover:border-solid
                rounded-2xl
                shadow-[0_4px_10px_rgba(0,0,0,0.4)]
                hover:shadow-[0_8px_20px_rgba(0,0,0,0.5)]
                hover:-translate-y-1
                transition-all
                duration-300"
              >
                <Plus
                  size={40}
                  className="sm:w-12 sm:h-12 text-neutral-600 group-hover:text-gray-300 group-hover:rotate-90 transition-all duration-500"
                />
                <span className="text-sm sm:text-base font-medium text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                  Add Widget
                </span>
                <span className="text-xs text-[#767676] group-hover:text-gray-200 transition-colors duration-300">
                  Click to get started
                </span>
              </button>
            </div>
          ) : (
            <>
              {[1, 2, 3].map((columnId) => {
                const isColumnHovered = dragOverColumn === columnId;
                const columnWidgets = getWidgetsByColumn(columnId);

                return (
                  <div
                    key={columnId}
                    className={`space-y-4 sm:space-y-6 mx-0 sm:mx-1 my-4 sm:my-6 transition-all duration-200 group ${
                      isColumnHovered ? "opacity-100" : "opacity-100"
                    }`}
                    onDragOver={(e) => handleColumnDragOver(e, columnId)}
                    onDrop={(e) => handleColumnDrop(e, columnId)}
                    onDragLeave={() => setDragOverColumn(null)}
                  >
                    {columnWidgets.map((widget) => {
                      const isDragging = draggedWidget?.id === widget.id;
                      const isDropTarget = dragOverWidget === widget.id;
                      const showAboveLine =
                        isDropTarget && dropPosition === "above";
                      const showBelowLine =
                        isDropTarget && dropPosition === "below";

                      return (
                        <div key={widget.id} className="relative">
                          {showAboveLine && (
                            <div className="absolute-top-2 left-0 right-0 h-0.5 bg-gray-500 rounded-full" />
                          )}

                          <div
                            draggable
                            onDragStart={(e) =>
                              handleWidgetDragStart(e, widget)
                            }
                            onDragEnd={handleWidgetDragEnd}
                            onDragOver={(e) => handleWidgetDragOver(e, widget)}
                            onDrop={(e) => handleWidgetDrop(e, widget)}
                            className={`
                            transition-all duration-200
                            ${isDragging ? "opacity-30 scale-95" : "opacity-100 scale-100"}
                          `}
                          >
                            <Widget
                              widget={widget}
                              widgets={widgets}
                              setWidgets={setWidgets}
                            />
                          </div>

                          {showBelowLine && (
                            <div className="absolute-bottom-2 left-0 right-0 h-0.5 bg-gray-500 rounded-full" />
                          )}
                        </div>
                      );
                    })}

                    <button
                      onClick={() => addWidget(columnId)}
                      className="flex items-center text-[#020202] justify-center select-none gap-2 px-3 rounded-xl transition-all duration-150 group-hover:text-[#767676]/75 hover:!text-white text-xs sm:text-sm pb-20"
                    >
                      <Plus size={18} className="sm:w-5 sm:h-5" />
                      <span className="text-sm">Add widget</span>
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
