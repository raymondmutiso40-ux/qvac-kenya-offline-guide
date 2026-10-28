const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("qvacAI", {
  loadModel: () => ipcRenderer.invoke("qvac-ai:load"),
  ask: (question, language) => ipcRenderer.invoke("qvac-ai:ask", { question, language }),
  onProgress: (callback) => {
    if (typeof callback !== "function") return () => {};
    const listener = (_event, data) => callback(data);
    ipcRenderer.on("qvac-ai:progress", listener);
    return () => ipcRenderer.removeListener("qvac-ai:progress", listener);
  }
});
