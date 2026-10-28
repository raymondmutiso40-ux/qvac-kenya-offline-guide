let data;let lang="en";let selectedService=null;
const $=id=>document.getElementById(id);
const t=(en,sw)=>lang==="en"?en:sw;
async function init(){
 try{const r=await fetch("data.json");data=await r.json();}
 catch(e){$("serviceGrid").innerHTML='<div class="empty">Could not load data.json. Keep index.html, app.js, styles.css and data.json in the same folder.</div>';return;}
 buildCategoryOptions();render();setLanguage();
}
function buildCategoryOptions(){
 const select=$("categoryFilter");
 data.categories.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;select.appendChild(o)});
 select.addEventListener("change",render);
}
function serviceTitle(s){return s.title[lang]||s.title.en}
function serviceSummary(s){return s.summary[lang]||s.summary.en}
function render(){
 if(!data)return;
 const q=$("search").value.trim().toLocaleLowerCase();
 const cat=$("categoryFilter").value;
 const found=data.services.filter(s=>{
  const hay=[s.title.en,s.title.sw,s.summary.en,s.summary.sw,s.category,s.agency,...s.documents.en,...s.documents.sw].join(" ").toLocaleLowerCase();
  return (!q||hay.includes(q))&&(cat==="all"||s.category===cat);
 });
 $("resultCount").textContent=`${found.length} ${t("services","huduma")}`;
 $("serviceGrid").innerHTML=found.length?found.map(s=>{
  const verify=s.status.toLowerCase().includes("verify");
  return `<button class="card" data-id="${s.id}"><span class="card-top"><span class="emoji">${s.icon}</span><span class="status ${verify?"verify":""}">${verify?t("Confirm details","Thibitisha"):t("Official source","Chanzo rasmi")}</span></span><h3>${esc(serviceTitle(s))}</h3><p>${esc(serviceSummary(s))}</p><span class="more">${t("View documents & steps →","Angalia nyaraka na hatua →")}</span></button>`;
 }).join(""):`<div class="empty">${t("No matching services. Try another keyword or category.","Hakuna huduma iliyopatikana. Jaribu neno au kategoria nyingine.")}</div>`;
 document.querySelectorAll(".card").forEach(b=>b.addEventListener("click",()=>openDetail(b.dataset.id)));
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openDetail(id){
 selectedService=data.services.find(s=>s.id===id);if(!selectedService)return;
 const s=selectedService;
 const title=serviceTitle(s),summary=serviceSummary(s);
 const docs=(s.documents[lang]||s.documents.en).map(x=>`<li>${esc(x)}</li>`).join("");
 const steps=(s.steps[lang]||s.steps.en).map(x=>`<li>${esc(x)}</li>`).join("");
 const note=s.note[lang]||s.note.en;
 $("modalBody").innerHTML=`<div class="detail-head"><div class="detail-icon">${s.icon}</div><h2 id="modalTitle">${esc(title)}</h2><p>${esc(summary)}</p><div class="detail-meta"><span class="meta-pill">${esc(s.category)}</span><span class="meta-pill">${esc(s.agency)}</span><span class="meta-pill">${esc(s.status)}</span></div></div>
 <div class="detail-grid"><section class="detail-box"><h3>${t("Documents to prepare","Nyaraka za kuandaa")}</h3><ul>${docs}</ul></section><section class="detail-box"><h3>${t("Steps to follow","Hatua za kufuata")}</h3><ol>${steps}</ol></section></div>
 <section class="source-box"><strong>${t("Official source & next step","Chanzo rasmi na hatua inayofuata")}</strong><p>${t("Responsible agency:","Idara husika:")} <b>${esc(s.agency)}</b></p><p>${esc(note)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener">${t("Read official guidance ↗","Soma mwongozo rasmi ↗")}</a>${s.applyUrl?`<a href="${esc(s.applyUrl)}" target="_blank" rel="noopener">${t("Official service portal ↗","Tovuti rasmi ya huduma ↗")}</a>`:""}<p class="source-note">${t("Source:","Chanzo:")} ${esc(s.sourceLabel||s.agency)}. ${t("This app summarizes information; the official agency page takes priority if anything differs.","Programu hii inafupisha taarifa; ukurasa rasmi wa idara ndio wa kufuata ikiwa kuna tofauti.")}</p></section>
 <button class="print-btn" id="printBtn">${t("Print / save this checklist","Chapisha / hifadhi orodha hii")}</button>`;
 $("modal").classList.remove("hidden");document.body.style.overflow="hidden";
 $("printBtn").addEventListener("click",()=>window.print());
}
function closeDetail(){$("modal").classList.add("hidden");document.body.style.overflow="";}
function setLanguage(){
 document.documentElement.lang=lang;
 $("languageToggle").textContent=lang==="en"?"Kiswahili":"English";
 $("brandSub").textContent=t("Government services, explained simply","Huduma za serikali, kwa maelezo rahisi");
 $("offlineLabel").textContent=t("Offline-ready","Tayari bila intaneti");
 $("eyebrow").textContent=t("KENYA · PUBLIC SERVICE KNOWLEDGE CENTRE","KENYA · KITUO CHA TAARIFA ZA HUDUMA ZA UMMA");
 $("headline").textContent=t("Know what you need before you go.","Jua unachohitaji kabla ya kwenda.");
 $("subhead").textContent=t("Find application steps, document checklists and official links for common government services.","Pata hatua za maombi, orodha ya nyaraka na viungo rasmi vya huduma za serikali.");
 $("search").placeholder=t("Search passport, birth certificate, KRA PIN…","Tafuta pasipoti, cheti cha kuzaliwa, PIN ya KRA…");
 $("countLabel").textContent=`${data.services.length} ${t("service guides","miongozo ya huduma")}`;
 $("langLabel").textContent=t("English","Kiswahili");
 $("offlineStatus").textContent=t("Works from local files","Hufanya kazi kutoka faili za ndani");
 $("categoryLabel").textContent=t("Category","Kategoria");
 $("countyLabel").textContent=t("Your county / town","Kaunti / mji wako");
 $("locationInput").placeholder=t("e.g. Nairobi, Mombasa, Kisumu","mf. Nairobi, Mombasa, Kisumu");
 $("whereBtn").textContent=t("Where should I go?","Niende wapi?");
 $("sectionEyebrow").textContent=t("SERVICE DIRECTORY","ORODHA YA HUDUMA");
 $("servicesTitle").textContent=t("Browse government services","Vinjari huduma za serikali");
 $("howEyebrow").textContent=t("HOW TO USE THIS APP","JINSI YA KUTUMIA PROGRAMU");
 $("howTitle").textContent=t("Prepare before you travel","Jiandae kabla ya kusafiri");
 $("how1Title").textContent=t("Choose a service","Chagua huduma");
 $("how1Text").textContent=t("Search by the document or service you need.","Tafuta kwa jina la nyaraka au huduma unayohitaji.");
 $("how2Title").textContent=t("Check your documents","Angalia nyaraka zako");
 $("how2Text").textContent=t("Use the checklist, then confirm case-specific requirements from the official source.","Tumia orodha, kisha thibitisha mahitaji ya hali yako kupitia chanzo rasmi.");
 $("how3Title").textContent=t("Confirm the office","Thibitisha ofisi");
 $("how3Text").textContent=t("Check the official agency or Huduma Kenya before travelling; not every service is offered everywhere.","Angalia idara rasmi au Huduma Kenya kabla ya kusafiri; si kila huduma inapatikana kila mahali.");
 $("noticeTitle").textContent=t("Important: use official sources","Muhimu: tumia vyanzo rasmi");
 $("noticeText").textContent=t("This is an independent guide, not a government website. Requirements, fees, office locations and timelines can change. Do not pay unofficial agents or share your eCitizen password/OTP.","Huu ni mwongozo huru, si tovuti ya serikali. Mahitaji, ada, maeneo ya ofisi na muda vinaweza kubadilika. Usilipe mawakala wasio rasmi au kushiriki nenosiri/OTP ya eCitizen.");
 $("sourcesTitle").textContent=t("Official starting points","Viungo rasmi vya kuanzia");
 $("footerRight").textContent=t("No government applications or payments are submitted here.","Hakuna maombi au malipo ya serikali yanayowasilishwa hapa.");
 const select=$("categoryFilter");select.options[0].textContent=t("All services","Huduma zote");
 render();
}
$("search").addEventListener("input",render);
$("clearSearch").addEventListener("click",()=>{$("search").value="";render();$("search").focus()});
$("languageToggle").addEventListener("click",()=>{lang=lang==="en"?"sw":"en";setLanguage();if(selectedService&&!$("modal").classList.contains("hidden"))openDetail(selectedService.id)});
$("closeModal").addEventListener("click",closeDetail);
$("modal").addEventListener("click",e=>{if(e.target.dataset.close==="true")closeDetail()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDetail()});
$("whereBtn").addEventListener("click",()=>{
 const loc=$("locationInput").value.trim();
 const title=t("Confirm your service location","Thibitisha eneo la huduma yako");
 const body=loc?t(`For ${loc}: not every office or Huduma Centre offers every service. Open the official Huduma Kenya centre directory and confirm that the selected centre handles your service before travelling. You can also call Huduma Kenya on 1919.`,`Kwa ${loc}: si kila ofisi au Huduma Centre hutoa kila huduma. Fungua orodha rasmi ya vituo vya Huduma Kenya na uthibitishe kuwa kituo hicho kinatoa huduma yako kabla ya kusafiri. Unaweza pia kupiga Huduma Kenya kwa 1919.`):t("Enter your county or town, then confirm the service at the official Huduma Kenya directory. Not every centre offers every service. Huduma Kenya lists help line 1919.","Weka kaunti au mji wako, kisha thibitisha huduma kwenye orodha rasmi ya Huduma Kenya. Si kila kituo hutoa kila huduma. Huduma Kenya ina nambari ya msaada 1919.");
 $("modalBody").innerHTML=`<div class="detail-head"><div class="detail-icon">📍</div><h2 id="modalTitle">${title}</h2><p>${esc(body)}</p></div><section class="source-box"><strong>${t("Official directory","Orodha rasmi")}</strong><p><a href="https://www.hudumakenya.go.ke/" target="_blank" rel="noopener">${t("Open Huduma Kenya ↗","Fungua Huduma Kenya ↗")}</a> <a href="https://gok.kenya.go.ke/" target="_blank" rel="noopener">${t("Government of Kenya portal ↗","Tovuti ya Serikali ya Kenya ↗")}</a></p></section>`;
 $("modal").classList.remove("hidden");document.body.style.overflow="hidden";
});

// QVAC local AI bridge: only available in the packaged Electron desktop app.
let aiLoaded = false;
let aiBusy = false;
const aiText = (en, sw) => lang === "en" ? en : sw;
function addAiMessage(text, who) {
  const log = $("aiChatLog");
  const bubble = document.createElement("div");
  bubble.className = `ai-message ${who}`;
  bubble.textContent = text;
  log.appendChild(bubble);
  log.scrollTop = log.scrollHeight;
  return bubble;
}
function setAiStatus(message) { const el = $("aiStatus"); if (el) el.textContent = message; }
function initAiUi() {
  const loadBtn = $("loadAiBtn");
  const form = $("aiForm");
  const question = $("aiQuestion");
  if (!loadBtn || !form || !question) return;
  if (!window.qvacAI) {
    setAiStatus(aiText("Desktop AI bridge not available. Run the packaged Windows app.", "Daraja la AI la programu ya kompyuta halipatikani. Fungua programu ya Windows iliyojengwa."));
    loadBtn.disabled = true;
    $("aiSendBtn").disabled = true;
    return;
  }
  window.qvacAI.onProgress(progress => {
    $("aiProgressWrap").classList.remove("hidden");
    $("aiProgressBar").style.width = `${Math.max(0, Math.min(100, progress.percentage || 0))}%`;
    $("aiProgressText").textContent = aiText(
      `Downloading/preparing model: ${Math.round(progress.percentage || 0)}%`,
      `Inapakua/inaandaa modeli: ${Math.round(progress.percentage || 0)}%`
    );
  });
  loadBtn.addEventListener("click", async () => {
    loadBtn.disabled = true;
    $("aiProgressWrap").classList.remove("hidden");
    $("aiProgressText").textContent = aiText("Loading model. The first download needs internet and may take time…", "Inapakia modeli. Upakuaji wa kwanza unahitaji intaneti na unaweza kuchukua muda…");
    setAiStatus(aiText("Loading local model…", "Inapakia modeli ya ndani…"));
    try {
      const result = await window.qvacAI.loadModel();
      if (!result.ok) throw new Error(result.message || "Model load failed");
      aiLoaded = true;
      setAiStatus(aiText("Offline AI ready", "AI ya bila intaneti iko tayari"));
      $("aiProgressBar").style.width = "100%";
      $("aiProgressText").textContent = aiText("Model ready. You can disconnect from the internet and ask questions.", "Modeli iko tayari. Unaweza kuzima intaneti na kuuliza maswali.");
      loadBtn.textContent = aiText("AI model loaded", "Modeli ya AI imepakiwa");
      addAiMessage(aiText("QVAC AI is ready. Ask your question below.", "QVAC AI iko tayari. Uliza swali lako hapa chini."), "assistant");
    } catch (error) {
      setAiStatus(aiText("Could not load AI model", "Haikuweza kupakia modeli ya AI"));
      $("aiProgressText").textContent = `${error.message || error}. ${aiText("Check internet for first download, disk space, RAM, and Windows Vulkan/GPU drivers.", "Angalia intaneti kwa upakuaji wa kwanza, nafasi ya diski, RAM na viendeshi vya Vulkan/GPU vya Windows.")}`;
      loadBtn.disabled = false;
    }
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const prompt = question.value.trim();
    if (!prompt || aiBusy) return;
    if (!aiLoaded) {
      addAiMessage(aiText("Load the offline AI model first.", "Pakia modeli ya AI kwanza."), "assistant");
      return;
    }
    addAiMessage(prompt, "user");
    question.value = "";
    aiBusy = true;
    $("aiSendBtn").disabled = true;
    const pending = addAiMessage(aiText("Thinking locally…", "Inafikiri kwenye kifaa hiki…"), "assistant");
    try {
      const result = await window.qvacAI.ask(prompt, lang);
      pending.textContent = result.answer || aiText("No answer returned.", "Hakuna jibu lililorudishwa.");
      if (!result.ok) setAiStatus(aiText("AI returned an error; check the message above.", "AI imerudisha hitilafu; angalia ujumbe hapo juu."));
    } catch (error) {
      pending.textContent = `${aiText("AI error: ", "Hitilafu ya AI: ")}${error.message || error}`;
    } finally {
      aiBusy = false;
      $("aiSendBtn").disabled = false;
      $("aiChatLog").scrollTop = $("aiChatLog").scrollHeight;
    }
  });
}

if("serviceWorker" in navigator && location.protocol.startsWith("http")){window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}))}
initAiUi();
init();
