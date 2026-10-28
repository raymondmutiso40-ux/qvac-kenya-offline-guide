# QVAC — Kenya Public Service Guide + Offline AI

This build integrates Tether's official `@qvac/sdk` JavaScript/TypeScript SDK (version 0.22.0) into the Windows desktop app.

## AI model

- Model: `LLAMA_3_2_1B_INST_Q4_0` (Llama 3.2 1B Instruct, Q4).
- Runtime: local inference through QVAC SDK; no cloud AI API is used.
- Grounding: before answering, QVAC retrieves up to four relevant local service guides and supplies their bilingual checklists/steps to the model.
- Language: the assistant is instructed to answer in the language used by the user (English or Kiswahili).
- First use: click **Load offline AI model** while connected to the internet. The SDK downloads/caches the model.
- Later use: after the model is fully downloaded and cached, inference is designed to work offline.

## Build the Windows EXE

1. Install **Node.js 22.21+** from https://nodejs.org/ (Windows installer `.msi`, 64-bit for most Intel/AMD PCs).
2. Extract this whole folder.
3. Double-click `build-windows.bat`.
4. The `dist` folder should contain the setup installer and portable executable.

The first build needs internet to install npm dependencies. The first AI model load also needs internet to fetch the model weights. This ZIP does not contain the model weights.

## Hardware requirements

QVAC's current SDK docs specify Windows 10+ x64, Vulkan runtime/driver version 1.4 or newer, at least 2 GB available RAM to load a model (4 GB+ recommended), and about 5 GB free disk space recommended. Many models fail to load below 4 GB RAM. The 1B Q4 model is a small starting point, but speed and compatibility depend on the PC and GPU driver. Validate with the official QVAC `qvac doctor` guidance.

## Important

- This is an integration scaffold; it has not been built or run against your specific Windows hardware in this environment.
- Model load/inference depends on QVAC SDK's native worker and Vulkan prerequisites; test the built EXE on the target Windows PC.
- The app's knowledge base currently contains 22 guides in 11 categories. It is not a complete official government database.
- Checklists are summaries. Requirements, fees, timelines, and office availability can change. The AI is instructed not to invent missing details, but generated answers can still be wrong; always verify important details with the official agency.
- The official links need internet. Local AI answers and stored guide data are intended to work offline after the model is downloaded.
- The app does not submit government applications or payments.

See `SOURCES.md` for official government starting points and `https://docs.qvac.tether.io/sdk/` for the SDK.
