# Huduma Guide Kenya — expanded offline MVP

A searchable English/Kiswahili guide for Kenyan government-service information.

## Current contents
- 22 service guides across 11 categories.
- Document checklists and step-by-step instructions inside the app.
- Official source and application portal links.
- Category filtering, search, English/Kiswahili toggle, print/save checklist.
- County/town prompt with official Huduma Kenya directory and helpline guidance.
- Local JSON data and service-worker caching for installable/offline use.

## Run
### Quick preview
For the simplest test, open `index.html` in a browser. Some browsers restrict `fetch()` when opened directly from a file, so if the directory fails to load, run a local server.

### Run using Python
From this folder in PowerShell:
```powershell
py -m http.server 8000
```
Then open http://localhost:8000

### Run using VS Code
Install the Live Server extension, right-click `index.html`, and select **Open with Live Server**.

## Important limits
This is an expanded MVP, not an official government app or a production-certified legal guide. The included content is a starting dataset, not a claim that every checklist is fully verified for every applicant. The app links to official sources; the official agency instructions take priority. Do not add unverified fees or processing times. Before public launch, verify each checklist, record the date checked, add per-county office data from official directories, and establish a content-review/update process.

## Update content
Edit `data.json`. Each service includes title and summary in English/Kiswahili, category, documents, steps, agency, official source URL, status and a caution note.


## QVAC desktop packaging
See `README-QVAC.md` and run `build-windows.bat` on Windows to create the installer and portable EXE.
