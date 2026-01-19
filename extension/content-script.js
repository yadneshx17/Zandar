// // listen to signal from the Extension Popup
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type == "NEW_LINK_INTENT") {
//     console.log("BRIDGE RECEIVED: ", message.payload);

//     window.postMessage(
//       {
//         type: "ZANDAR_SAVE",
//         payload: message.payload,
//       },
//       "*",
//     ); // replace * with zandar for security.
//   }
// });
window.addEventListener("message", async (event) => {
  // Security Check
  if (event.source !== window) return;

  // 1. React says "I'm ready" -> We check the queue
  if (event.data.type === "ZANDAR_APP_READY") {
    console.log("👋 Zandar App connected. Checking queue...");
    await checkAndSendQueue();
  }

  // 2. React says "I saved them" -> We clear the queue
  if (event.data.type === "ZANDAR_CLEAR_QUEUE") {
    console.log("✅ Saved. Clearing mailbox.");
    chrome.storage.local.set({ zandar_queue: [] });
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
      ["http://localhost:5173/*", "https://zandar.site/*"],
    );
    // chrome.storage.local.set({ zandar_queue: [] });
  }
});

window.addEventListener("message", (event) => {
  if (event.source != window) return;

  if (event.data.type === "ZANDAR_CLEAR_QUEUE") {
    console.log("Zandar saved links. Emptying mailbox.");
    chrome.storage.local.set({ zandar_queue: [] });
  }
});

async function checkAndSendQueue() {
  const data = await chrome.storage.local.get("zandar_queue");
  const queue = data.zandar_queue || [];

  if (queue.length === 0) return;
  console.log(`📬 Found ${queue.length} items in queue. Sending to Zandar...`);
  // ✅ FIX: Use 'window.location.origin' instead of an array string
  window.postMessage(
    {
      type: "ZANDAR_INGEST_LINKS",
      payload: queue,
    },
    ["http://localhost:5173/*", "https://zandar.site/*"],
  );
}

// document.addEventListener("DOMContentLoaded", async () => {
//   const data = await chrome.storage.local.get("zandar_queue");
//   const currentQueue = data.zandar_queue || [];

//   // 2. Safety Check: Don't spam if empty
//   if (currentQueue.length === 0) return;

//   console.log("🚀 Found offline links:", currentQueue);

//   // 3. Send to Zandar
//   window.postMessage(
//     {
//       type: "ZANDAR_INGEST_LINKS",
//       payload: currentQueue,
//     },
//     ["http://localhost:5173/*", "https://zandar.site/*"],
//   );
//   // chrome.storage.local.set({ zandar_queue: [] });
// });
