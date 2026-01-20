window.addEventListener("message", async (event) => {
  // Security Check
  if (event.source !== window) return;

  // React says "I'm ready" -> We check the queue
  if (event.data.type === "ZANDAR_APP_READY") {
    console.log("👋 Zandar App connected. Checking queue...");
    await checkAndSendQueue();
  }

  // React says "I saved them" -> We clear the queue
  if (event.data.type === "ZANDAR_CLEAR_QUEUE") {
    console.log("✅ Saved. Clearing mailbox.");
    chrome.storage.local.set({ zandar_queue: [] });
  }

  if (event.data.type === "ZANDAR_SYNC_STRUCTURE") {
    console.log("Syncing pages and widgets to chrome.storage...");
    const { pages, widgets } = event.data.payload;

    // Store pages and widgets in chrome.storage for extension/popup to use
    chrome.storage.local.set(
      {
        zandar_pages: pages || [],
        zandar_widgets: widgets || [],
        zandar_last_sync: Date.now(),
      },
      () => {
        console.log("Pages and widgets synced to chrome.storage");
      },
    );
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName == "local" && changes.zandar_queue) {
    const newQueue = changes.zandar_queue.newValue || [];

    if (newQueue.length == 0) return;

    window.postMessage(
      {
        type: "ZANDAR_INGEST_LINKS",
        payload: newQueue,
      },
      [
        "http://localhost:5173/*",
        "https://zandar.site/*",
        "https://www.zandar.site/*",
      ],
    );
  }
});

async function checkAndSendQueue() {
  const data = await chrome.storage.local.get("zandar_queue");
  const queue = data.zandar_queue || [];

  if (queue.length === 0) return;
  console.log(`Found ${queue.length} items in queue. Sending to Zandar...`);
  // LATER: Use 'window.location.origin' instead of an array string
  window.postMessage(
    {
      type: "ZANDAR_INGEST_LINKS",
      payload: queue,
    },
    [
      "http://localhost:5173/*",
      "https://zandar.site/*",
      "https://www.zandar.site/*",
    ],
  );
}
