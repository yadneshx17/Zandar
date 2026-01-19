// document.addEventListener("DOMContentLoaded", async () => {
//   const tabs = await chrome.tabs.query({ url: ["http://localhost:5173/*", "https://zandar.site/*"] });
//   if (tabs.length === 0) {
//     document.body.innerHTML = `
//       <div style="padding: 20px; text-align: center; color: #a1a1aa;">
//         <p>Zandar is not open.</p>
//         <a href="http://localhost:5173" target="_blank" style="color: white;">Open Zandar</a>
//       </div>
//     `;
//     return;
//   }

// })

document.getElementById("saveBtn").addEventListener("click", async () => {
  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const linkData = { url: currentTab.url, title: currentTab.title }; // link data

  // data object
  const newLink = {
    url: linkData.url,
    title: linkData.title,
    timestamp: Date.now(),
  };

  // read the queue
  const data = await chrome.storage.local.get("zandar_queue");
  const currnetQueue = data.zandar_queue || [];

  // write into the queue
  const updatedQueue = [...currnetQueue, newLink];
  await chrome.storage.local.set({ zandar_queue: updatedQueue });

  // UX
  document.getElementById("saveBtn").innerText = "Saved!";

  // console.log(await chrome.storage.local.get("zandar_queue"));

  // const zandarTabs = await chrome.tabs.query({ url: "http://localhost:5173/*" });

  // if (zandarTabs.length > 0) {
  //   const zandarTabId = zandarTabs[0].id;
  //   console.log(linkData);
  //   chrome.tabs.sendMessage(zandarTabId, {
  //     type: "NEW_LINK_INTENT",
  //     payload: linkData,
  //   });
  // } else {
  //   chrome.tabs.create({ url: "http://localhost:5173" });
  // }
});
