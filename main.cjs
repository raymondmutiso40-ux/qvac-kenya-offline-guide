const { app, BrowserWindow, shell, ipcMain } = require("electron");
const http = require("http");
const fs = require("fs");
const path = require("path");

let server;
let mainWindow;
let qvacSdk;
let modelId = null;
let modelLoading = null;
let servicesCache = null;
const root = __dirname;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function startLocalServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      let pathname;
      try { pathname = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname); }
      catch { res.writeHead(400); return res.end("Bad request"); }
      if (pathname === "/") pathname = "/index.html";
      const filePath = path.resolve(root, "." + pathname);
      if (!filePath.startsWith(root + path.sep) && filePath !== path.join(root, "index.html")) {
        res.writeHead(403); return res.end("Forbidden");
      }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); return res.end("Not found"); }
        res.writeHead(200, {
          "Content-Type": mime[path.extname(filePath)] || "application/octet-stream",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff"
        });
        res.end(data);
      });
    });
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}/`);
    });
  });
}

function getServices() {
  if (!servicesCache) {
    servicesCache = JSON.parse(fs.readFileSync(path.join(root, "data.json"), "utf8")).services;
  }
  return servicesCache;
}

function rankService(service, query) {
  const terms = query.toLocaleLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/).filter(w => w.length > 2);
  const fields = [
    service.title?.en, service.title?.sw, service.summary?.en, service.summary?.sw,
    service.category, service.agency, ...(service.documents?.en || []),
    ...(service.documents?.sw || []), ...(service.steps?.en || []), ...(service.steps?.sw || [])
  ].join(" ").toLocaleLowerCase().normalize("NFKD");
  return terms.reduce((score, term) => score + (fields.includes(term) ? (term.length > 5 ? 3 : 1) : 0), 0);
}

function retrieveContext(question, language) {
  const matches = getServices().map(service => ({ service, score: rankService(service, question) }))
    .filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
  if (!matches.length) {
    return language === "sw"
      ? "Hakuna mwongozo maalum uliopatikana kwenye hifadhidata ya ndani. Mwambie mtumiaji atafute huduma kwenye orodha ya QVAC na athibitishe kwenye tovuti rasmi."
      : "No specific matching guide was found in the local knowledge base. Ask the user to search the QVAC directory and verify details with the official agency.";
  }
  return matches.map(({ service }) => {
    const title = service.title?.[language] || service.title?.en;
    const summary = service.summary?.[language] || service.summary?.en;
    const documents = service.documents?.[language] || service.documents?.en || [];
    const steps = service.steps?.[language] || service.steps?.en || [];
    const note = service.note?.[language] || service.note?.en || "";
    return [
      `SERVICE: ${title}`,
      `CATEGORY: ${service.category}`,
      `AGENCY: ${service.agency}`,
      `SUMMARY: ${summary}`,
      `DOCUMENTS (summary; verify current case-specific requirements): ${documents.join("; ")}`,
      `STEPS: ${steps.join("; ")}`,
      `NOTE: ${note}`,
      `OFFICIAL URL: ${service.url || ""}`,
      `APPLICATION URL: ${service.applyUrl || ""}`
    ].join("\n");
  }).join("\n\n---\n\n");
}

async function loadQvacModel() {
  if (modelId) return { ok: true, loaded: true, message: "QVAC local model is ready." };
  if (modelLoading) return modelLoading;
  modelLoading = (async () => {
    qvacSdk = await import("@qvac/sdk");
    const { loadModel, LLAMA_3_2_1B_INST_Q4_0 } = qvacSdk;
    const id = await loadModel({
      modelSrc: LLAMA_3_2_1B_INST_Q4_0,
      onProgress: progress => {
        if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send("qvac-ai:progress", {
          phase: "download",
          percentage: Number(progress.percentage || 0),
          downloaded: Number(progress.downloaded || 0),
          total: Number(progress.total || 0)
        });
      }
    });
    modelId = id;
    return { ok: true, loaded: true, message: "Local AI model loaded and ready." };
  })().catch(error => {
    return { ok: false, loaded: false, message: error?.message || String(error) };
  }).finally(() => { modelLoading = null; });
  return modelLoading;
}

ipcMain.handle("qvac-ai:load", async () => loadQvacModel());

ipcMain.handle("qvac-ai:ask", async (_event, payload) => {
  const question = String(payload?.question || "").trim().slice(0, 3000);
  const language = payload?.language === "sw" ? "sw" : "en";
  if (!question) return { ok: false, answer: "Please enter a question." };
  if (!modelId || !qvacSdk) return { ok: false, answer: language === "sw"
    ? "Washa kwanza QVAC AI ili kupakia modeli ya ndani."
    : "Please enable QVAC AI first to load the local model." };
  try {
    const context = retrieveContext(question, language);
    const systemPrompt = language === "sw"
      ? `Wewe ni msaidizi wa QVAC kuhusu huduma za serikali ya Kenya. Jibu kwa Kiswahili kinachoeleweka. Tumia muktadha wa hifadhidata ya ndani hapa chini. Usibuni ada, tarehe, ofisi, sheria au nyaraka. Ikiwa taarifa haipo au haijathibitishwa, sema hivyo na elekeza mtumiaji kuthibitisha kupitia kiungo rasmi kilichotolewa. Taja kuwa orodha ya nyaraka ni muhtasari na mahitaji hutegemea hali ya mtu. Usidai kuwa umewasilisha ombi.\\n\\nHIFADHI YA NDANI:\\n${context}`
      : `You are QVAC, an assistant for Kenyan government services. Answer in clear English. Use the local knowledge-base context below. Do not invent fees, dates, offices, laws, or required documents. If information is missing or uncertain, say so and direct the user to verify using the official link provided. State that checklists are summaries and requirements can vary by case. Never claim you submitted an application.\\n\\nLOCAL KNOWLEDGE BASE:\\n${context}`;
    const result = qvacSdk.completion({
      modelId,
      history: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      stream: true
    });
    let answer = "";
    for await (const token of result.tokenStream) answer += token;
    return { ok: true, answer: answer.trim() || (language === "sw" ? "Sijaweza kutoa jibu." : "I could not generate an answer.") };
  } catch (error) {
    return { ok: false, answer: error?.message || String(error) };
  }
});

async function createWindow() {
  const localUrl = await startLocalServer();
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 900,
    minWidth: 760,
    minHeight: 640,
    title: "QVAC — Kenya Public Service Guide + Offline AI",
    backgroundColor: "#f5f8f6",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(root, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(localUrl)) {
      event.preventDefault();
      if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    }
  });
  mainWindow.on("closed", () => { mainWindow = null; });
  await mainWindow.loadURL(localUrl);
}

app.whenReady().then(createWindow).catch(err => {
  console.error(err);
  app.quit();
});
app.on("before-quit", () => {
  if (server) server.close();
  if (modelId && qvacSdk?.unloadModel) qvacSdk.unloadModel({ modelId }).catch(() => {});
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
