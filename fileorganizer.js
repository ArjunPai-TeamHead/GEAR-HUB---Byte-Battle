const DB_NAME = "edukit_files_db_v1";
const DB_STORE = "files";
let dbPromise = null;

function openDB(){
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}
async function idbPut(key, blob){
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(blob, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbGet(key){
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const r = tx.objectStore(DB_STORE).get(key);
    r.onsuccess = ()=> res(r.result);
    r.onerror = ()=> rej(r.error);
  });
}
async function idbDelete(key){
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(key);
    tx.oncomplete = ()=> res();
    tx.onerror = ()=> rej(tx.error);
  });
}

/* ---------------------- State storage (metadata) ---------------------- */
const STORAGE_KEY = "edukit_file_explorer_meta_v2";

function safeParse(s){
  try { return JSON.parse(s||"{}"); } catch(e){ console.warn("bad metadata, reset"); return {}; }
}
function loadMeta(){ return safeParse(localStorage.getItem(STORAGE_KEY)); }
function saveMeta(meta){ localStorage.setItem(STORAGE_KEY, JSON.stringify(meta)); }

let meta = (()=>{
  const m = loadMeta();
  if (!m.folders || !m.files){
    const init = {
      folders: [
        {id:"fld_root", name:"Home", parent:null, system:true},
        {id:"fld_trash", name:"Trash", parent:null, system:true},
        {id:"fld_docs", name:"Documents", parent:"fld_root"},
        {id:"fld_imgs", name:"Pictures", parent:"fld_root"}
      ],
      files: [] // metadata: {id,name,origName,type,size,blobKey,folderId,tags:[],createdAt}
    };
    saveMeta(init);
    return init;
  }
  return m;
})();

/* ---------------------- UI refs ---------------------- */
const $ = id => document.getElementById(id);
const folderListEl = $("folderList");
const tagListEl = $("tagList");
const fileGridEl = $("fileGrid");
const fileInput = $("fileInput");
const dropzone = $("dropzone");
const breadcrumbEl = $("breadcrumb");
const moveToEl = $("moveTo");
const previewModal = $("previewModal");
const previewBody = $("previewBody");
const previewName = $("previewName");
const closePreview = $("closePreview");
const downloadBtn = $("downloadBtn");
const renameBtn = $("renameBtn");
const tagBtn = $("tagBtn");
const smallModal = $("smallModal");
const smallTitle = $("smallTitle");
const smallInput = $("smallInput");
const smallSave = $("smallSave");
const smallClose = $("smallClose");
const searchInput = $("search");
const sortSelect = $("sort");
const backBtn = $("backBtn");
const forwardBtn = $("forwardBtn");
const upBtn = $("upBtn");
const refreshBtn = $("refreshBtn");
const newFolderBtn = $("newFolder");
const selectAllBtn = $("selectAll");
const deselectAllBtn = $("deselectAll");
const deleteSelectedBtn = $("deleteSelected");
const undoBtn = $("undo");
const moveSelectedBtn = $("moveSelected");
const exportSelectedBtn = $("exportSelected");
const gridViewBtn = $("gridView");
const listViewBtn = $("listView");
const clearAllBtn = $("clearAll");

/* ---------------------- runtime state ---------------------- */
let activeFolderId = "fld_root";
let selected = new Set();
let tagFilter = null;
let viewMode = "grid"; // grid | list
let backStack = [];
let forwardStack = [];
let undoStack = []; // for deletes
let previewFile = null;

/* ---------------------- helpers ---------------------- */
const uid = (n=8)=> Math.random().toString(36).slice(2,2+n);
const nowISO = ()=> new Date().toISOString();
const formatBytes = b => {
  if (!b) return "0 B";
  const units=["B","KB","MB","GB"]; let i=0; let v=b;
  while(v>=1024 && i<units.length-1){ v/=1024; i++; }
  return Math.round(v*10)/10 + " " + units[i];
};

/* ---------------------- rendering ---------------------- */
function renderAll(){
  renderFolders();
  renderTags();
  renderMoveTo();
  renderBreadcrumb();
  renderFiles();
  updateNavButtons();
  updateViewButtons();
}

function renderFolders(){
  folderListEl.innerHTML = "";
  meta.folders.forEach(f=>{
    const btn = document.createElement("button");
    btn.className="folder-item";
    if (f.id === activeFolderId) btn.classList.add("active");
    btn.dataset.id = f.id;
    btn.innerHTML = `<span>${escapeHtml(f.name)}</span><small style="color:var(--muted)">${countFilesInFolder(f.id)}</small>`;
    btn.onclick = ()=> navigateToFolder(f.id);
    // allow drop on folder to move files
    btn.addEventListener("dragover", e => e.preventDefault());
    btn.addEventListener("drop", (e)=> {
      e.preventDefault();
      const fileId = e.dataTransfer.getData("text/plain");
      if (!fileId) return;
      const mf = meta.files.find(x=>x.id===fileId);
      if (mf){ mf.folderId = f.id; saveMeta(meta); renderFiles(); }
    });
    folderListEl.appendChild(btn);
  });
}

function countFilesInFolder(fid){
  return meta.files.filter(x=>x.folderId===fid).length;
}

function gatherTags(){
  const s = new Set();
  meta.files.forEach(f=> (f.tags||[]).forEach(t=> s.add(t)));
  return Array.from(s);
}

function renderTags(){
  tagListEl.innerHTML = "";
  gatherTags().forEach(t=>{
    const b = document.createElement("button");
    b.className="tag-pill";
    if (tagFilter===t) b.classList.add("active");
    b.textContent = t;
    b.onclick = ()=> { tagFilter = tagFilter===t ? null : t; renderAll(); };
    tagListEl.appendChild(b);
  });
}

function renderMoveTo(){
  moveToEl.innerHTML = "";
  const def = document.createElement("option"); def.value=""; def.textContent="Select folder"; moveToEl.appendChild(def);
  meta.folders.filter(f=>!f.system).forEach(f=>{
    const o = document.createElement("option"); o.value = f.id; o.textContent = f.name; moveToEl.appendChild(o);
  });
}

function renderBreadcrumb(){
  const parts = [];
  let cur = meta.folders.find(x=>x.id===activeFolderId);
  if (!cur) { breadcrumbEl.textContent = "Home"; return; }
  // simple breadcrumb (we don't have deep nested tree in this model, but use parent if exists)
  parts.push(cur);
  if (cur.parent){
    const p = meta.folders.find(x=>x.id===cur.parent);
    if (p) parts.unshift(p);
  }
  breadcrumbEl.innerHTML = parts.map(p=>`<button class="crumb" data-id="${p.id}">${escapeHtml(p.name)}</button>`).join(" <span style='opacity:.5'>/</span> ");
  // wire crumb clicks
  breadcrumbEl.querySelectorAll(".crumb").forEach(btn=> btn.addEventListener("click", ()=> navigateToFolder(btn.dataset.id)));
}

function renderFiles(){
  fileGridEl.innerHTML = "";
  const q = (searchInput.value||"").toLowerCase();
  let results = meta.files.slice();

  // folder filters
  if (activeFolderId === "__all") {
    // include everything excluding trash
    const trashId = meta.folders.find(f=>f.name==="Trash")?.id;
    if (trashId) results = results.filter(f=> f.folderId !== trashId);
  } else if (activeFolderId === "__recent") {
    const cutoff = Date.now() - (7*24*60*60*1000);
    results = results.filter(f => new Date(f.createdAt).getTime() >= cutoff);
  } else if (activeFolderId === "__images") {
    results = results.filter(f => f.type && f.type.startsWith("image/"));
  } else {
    results = results.filter(f => f.folderId === activeFolderId);
  }

  // tag filter
  if (tagFilter) results = results.filter(f => (f.tags||[]).includes(tagFilter));

  // search filter
  if (q) results = results.filter(f=> f.name.toLowerCase().includes(q) || (f.origName||"").toLowerCase().includes(q) || (f.tags||[]).some(t=> t.toLowerCase().includes(q)));

  // sort
  const sort = sortSelect.value || "date";
  results.sort((a,b)=>{
    if (sort==="name") return a.name.localeCompare(b.name);
    if (sort==="size") return (a.size||0) - (b.size||0);
    if (sort==="type") return (a.type||"").localeCompare(b.type||"");
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // show grid or list depending on viewMode
  results.forEach(f => {
    const card = document.createElement("div"); card.className = "file-card"; card.tabIndex = 0; card.dataset.id = f.id;
    // thumbnail
    const thumb = document.createElement("div"); thumb.className = "file-thumb";
    if ((f.type||"").startsWith("image/")){
      // show image preview from idb
      const img = document.createElement("img"); img.alt = f.name;
      // async fill src
      idbGet(f.blobKey).then(blob => { if (blob) img.src = URL.createObjectURL(blob); }).catch(()=>{});
      thumb.appendChild(img);
    } else {
      const ico = document.createElement("div"); ico.style.fontSize="28px"; ico.style.opacity=.8; ico.textContent = fileIconForType(f.type);
      thumb.appendChild(ico);
    }

    const metaEl = document.createElement("div"); metaEl.className="file-meta";
    const nameEl = document.createElement("div"); nameEl.className="file-name"; nameEl.textContent = f.name;
    const subEl = document.createElement("div"); subEl.className="file-sub"; subEl.textContent = `${f.origName||''} • ${f.type||'unknown'} • ${f.size?formatBytes(f.size):'—'}`;
    metaEl.appendChild(nameEl); metaEl.appendChild(subEl);

    const actions = document.createElement("div"); actions.className="file-actions-inline";
    const chk = document.createElement("input"); chk.type="checkbox"; chk.className="checkbox-inline"; chk.checked = selected.has(f.id);
    chk.onclick = (e)=> { e.stopPropagation(); toggleSelect(f.id, chk.checked); };
    const openBtn = document.createElement("button"); openBtn.className="icon-btn"; openBtn.textContent="Open"; openBtn.onclick = (e)=> { e.stopPropagation(); openPreview(f.id); };
    const tagBtn = document.createElement("button"); tagBtn.className="icon-btn"; tagBtn.textContent="Tag"; tagBtn.onclick = (e)=> { e.stopPropagation(); promptTag(f.id); };
    const renameBtn = document.createElement("button"); renameBtn.className="icon-btn"; renameBtn.textContent="Rename"; renameBtn.onclick=(e)=>{ e.stopPropagation(); promptRename(f.id); };

    actions.appendChild(chk); actions.appendChild(openBtn); actions.appendChild(tagBtn); actions.appendChild(renameBtn);

    card.appendChild(thumb); card.appendChild(metaEl); card.appendChild(actions);

    // draggable
    card.draggable = true;
    card.addEventListener("dragstart", ev=> { ev.dataTransfer.setData("text/plain", f.id); card.classList.add("dragging"); });
    card.addEventListener("dragend", ()=> card.classList.remove("dragging"));

    // click to open
    card.addEventListener("click", ()=> openPreview(f.id));
    card.addEventListener("keydown", (e)=> { if (e.key === "Enter") openPreview(f.id); });

    fileGridEl.appendChild(card);
  });
}

/* ---------------------- navigation & history ---------------------- */
function navigateToFolder(folderId, pushHistory = true){
  if (pushHistory) {
    backStack.push(activeFolderId);
    forwardStack = [];
  }
  activeFolderId = folderId;
  selected.clear();
  renderAll();
}
function goBack(){
  if (!backStack.length) return;
  forwardStack.push(activeFolderId);
  activeFolderId = backStack.pop();
  selected.clear();
  renderAll();
}
function goForward(){
  if (!forwardStack.length) return;
  backStack.push(activeFolderId);
  activeFolderId = forwardStack.pop();
  selected.clear();
  renderAll();
}
function goUp(){
  const cur = meta.folders.find(f=>f.id===activeFolderId);
  if (!cur) return;
  if (cur.parent){ navigateToFolder(cur.parent); return; }
  // if no parent and not root, go to root
  if (activeFolderId !== "fld_root") navigateToFolder("fld_root");
}
function updateNavButtons(){
  backBtn.disabled = backStack.length===0;
  forwardBtn.disabled = forwardStack.length===0;
}

/* ---------------------- selection & bulk actions ---------------------- */
function toggleSelect(id, on){
  if (on) selected.add(id); else selected.delete(id);
}
function selectAllVisible(){
  document.querySelectorAll('.file-card').forEach(c => { const id = c.dataset.id; if (id){ selected.add(id); const cb = c.querySelector('input[type=checkbox]'); if (cb) cb.checked=true; }});
}
function deselectAll(){
  selected.clear();
  document.querySelectorAll('.file-card input[type=checkbox]').forEach(cb => cb.checked=false);
}

function deleteSelected(){
  if (!selected.size) return alert("No files selected.");
  if (!confirm("Move selected files to Trash?")) return;
  const trashId = meta.folders.find(f=>f.name==="Trash")?.id;
  const moved = [];
  meta.files.forEach(f => { if (selected.has(f.id)){ moved.push({...f}); f.folderId = trashId || f.folderId; } });
  pushUndo({type:"delete", files:moved});
  selected.clear(); saveMeta(meta); renderAll();
}
function moveSelectedTo(destId){
  if (!destId) return alert("Select destination");
  meta.files.forEach(f => { if (selected.has(f.id)){ f.folderId = destId; } });
  selected.clear(); saveMeta(meta); renderAll();
}
function exportSelected(){
  const arr = meta.files.filter(f=> selected.has(f.id));
  if (!arr.length) return alert("No files selected.");
  const exportMeta = arr.map(a => ({...a, blobKey: a.blobKey}));
  const blob = new Blob([JSON.stringify(exportMeta, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download='files-export.json'; a.click(); URL.revokeObjectURL(url);
}

/* ---------------------- undo ---------------------- */
function pushUndo(item){
  undoStack.push(item);
  if (undoStack.length>20) undoStack.shift();
}
function doUndo(){
  if (!undoStack.length) return alert("Nothing to undo");
  const it = undoStack.pop();
  if (it.type==="delete"){
    // restore by pushing back the deleted metadata (but blob remains in idb)
    it.files.forEach(fi => {
      // only push if not already present
      if (!meta.files.find(x=>x.id===fi.id)) meta.files.push(fi);
    });
    saveMeta(meta); renderAll();
  }
}

/* ---------------------- upload & idb store ---------------------- */
fileInput.addEventListener("change", e => {
  if (!e.target.files) return;
  handleUpload(e.target.files);
  e.target.value = "";
});
dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.classList.add("dragover"); });
dropzone.addEventListener("dragleave", ()=> dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", e => { e.preventDefault(); dropzone.classList.remove("dragover"); if (e.dataTransfer.files) handleUpload(e.dataTransfer.files); });

async function handleUpload(fileList){
  const arr = Array.from(fileList);
  for (const f of arr){
    const id = "f_"+uid(10);
    const blobKey = "blob_"+id;
    // save blob to idb
    await idbPut(blobKey, f);
    // metadata
    meta.files.unshift({
      id,
      name: f.name,
      origName: f.name,
      type: f.type || guessType(f.name),
      size: f.size,
      blobKey,
      folderId: activeFolderId || "fld_root",
      tags: [],
      createdAt: nowISO()
    });
  }
  saveMeta(meta); renderAll();
}

/* ---------------------- preview / download / rename / tag ---------------------- */
async function openPreview(fileId){
  const entry = meta.files.find(x=>x.id===fileId); if (!entry) return;
  previewFile = entry;
  previewName.textContent = entry.name;
  previewBody.innerHTML = "";
  const blob = await idbGet(entry.blobKey);

  if (!blob){
    previewBody.textContent = "File data missing.";
  } else if ((entry.type||"").startsWith("image/")){
    const img = document.createElement("img"); img.src = URL.createObjectURL(blob); previewBody.appendChild(img);
  } else if (entry.type === "application/pdf"){
    const iframe = document.createElement("iframe"); iframe.src = URL.createObjectURL(blob); previewBody.appendChild(iframe);
  } else if ((entry.type||"").startsWith("text/") || entry.type==="application/json"){
    const text = await blob.text();
    const pre = document.createElement("pre"); pre.style.whiteSpace="pre-wrap"; pre.style.color="#dbe9ff"; pre.textContent = text;
    previewBody.appendChild(pre);
  } else {
    const p = document.createElement("div"); p.textContent = `${entry.origName || entry.name} — preview not available.`; p.style.color = "var(--muted)";
    previewBody.appendChild(p);
  }

  // download handler
  downloadBtn.onclick = async ()=> {
    const b = await idbGet(entry.blobKey);
    if (!b) return alert("Missing blob");
    const url = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href = url; a.download = entry.name; a.click(); URL.revokeObjectURL(url);
  };

  // rename/tag handlers
  renameBtn.onclick = ()=> promptRename(entry.id);
  tagBtn.onclick = ()=> promptTag(entry.id);

  previewModal.classList.remove("hidden");
  previewModal.setAttribute("aria-hidden", "false");
}
closePreview.onclick = ()=> { previewModal.classList.add("hidden"); previewModal.setAttribute("aria-hidden","true"); previewFile=null; };

/* small modal */
function promptRename(id){
  const f = meta.files.find(x=>x.id===id); if (!f) return;
  smallTitle.textContent = "Rename file";
  smallInput.value = f.name;
  smallModal.classList.remove("hidden");
  smallModal.setAttribute("aria-hidden", "false");
  smallSave.onclick = ()=> {
    const v = smallInput.value.trim(); if (!v) return alert("Name required");
    f.name = v; saveMeta(meta); smallModal.classList.add("hidden"); renderAll();
  };
}
function promptTag(id){
  const f = meta.files.find(x=>x.id===id); if (!f) return;
  smallTitle.textContent = "Add tag (single)";
  smallInput.value = "";
  smallModal.classList.remove("hidden");
  smallModal.setAttribute("aria-hidden", "false");
  smallSave.onclick = ()=> {
    const v = smallInput.value.trim(); if (!v) { smallModal.classList.add("hidden"); return; }
    f.tags = f.tags || []; if (!f.tags.includes(v)) f.tags.push(v);
    saveMeta(meta); smallModal.classList.add("hidden"); renderAll();
  };
}
smallClose.onclick = ()=> smallModal.classList.add("hidden");
$("smallCancel").onclick = ()=> smallModal.classList.add("hidden");

/* ---------------------- small utils ---------------------- */
function guessType(name){
  const ext = (name.split('.').pop() || "").toLowerCase();
  if (["png","jpg","jpeg","gif","webp"].includes(ext)) return "image/"+ext;
  if (["txt","md","csv","log"].includes(ext)) return "text/plain";
  if (ext==="pdf") return "application/pdf";
  if (["mp4","webm"].includes(ext)) return "video/"+ext;
  if (["mp3","wav"].includes(ext)) return "audio/"+ext;
  return "";
}
function fileIconForType(type){
  if (!type) return "📄";
  if (type.startsWith("image/")) return "🖼️";
  if (type.startsWith("video/")) return "🎞️";
  if (type.startsWith("audio/")) return "🎵";
  if (type==="application/pdf") return "📕";
  if (type.startsWith("text/") || type==="application/json") return "📄";
  return "📄";
}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

$("gridView").onclick = ()=> { viewMode="grid"; renderFiles(); updateViewButtons(); };
$("listView").onclick = ()=> { viewMode="list"; renderFiles(); updateViewButtons(); };
$("search").addEventListener("input", debounce(()=> renderFiles(), 200));
$("sort").addEventListener("change", ()=> renderFiles());
backBtn.onclick = goBack; forwardBtn.onclick = goForward; upBtn.onclick = goUp; refreshBtn.onclick = ()=> renderAll();

newFolderBtn.onclick = ()=> {
  const name = prompt("Folder name:", "New Folder"); if (!name) return;
  meta.folders.push({id:"fld_"+uid(6), name, parent: activeFolderId});
  saveMeta(meta); renderAll();
};

selectAllBtn.onclick = () => selectAllVisible();
deselectAllBtn.onclick = () => { selected.clear(); deselectAllCheckboxes(); };
deleteSelectedBtn.onclick = () => deleteSelected();
undoBtn.onclick = () => doUndo();
moveSelectedBtn.onclick = () => { moveSelectedTo(moveToEl.value); };
exportSelectedBtn.onclick = () => exportSelected();
clearAllBtn.onclick = () => {
  if (!confirm("Clear stored state (metadata and blobs) ?")) return;

  localStorage.removeItem(STORAGE_KEY);

  const req = indexedDB.deleteDatabase(DB_NAME);
  req.onsuccess = ()=> location.reload();
  req.onerror = ()=> alert("Failed to clear DB");
};

function deselectAllCheckboxes(){ document.querySelectorAll('.file-card input[type=checkbox]').forEach(cb => cb.checked=false); }

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key.toLowerCase()==='a'){ e.preventDefault(); selectAllVisible(); }
});

function selectAllVisible(){ document.querySelectorAll('.file-card').forEach(c => { const id=c.dataset.id; if (id){ selected.add(id); const cb=c.querySelector('input[type=checkbox]'); if (cb) cb.checked=true; }}); }
function toggleSelect(id, on){ if (on) selected.add(id); else selected.delete(id); }

function navigateToSpecialView(view){

  backStack.push(activeFolderId);
  activeFolderId = view;
  selected.clear(); renderAll();
}

document.querySelectorAll('.quick').forEach(btn => btn.addEventListener('click', ()=> navigateToSpecialView(btn.dataset.view)));

async function init(){
  if (!meta.folders.find(f=>f.name==="Trash")) {
    meta.folders.push({id:"fld_trash", name:"Trash", system:true});
    saveMeta(meta);
  }
  renderAll();
}
function updateViewButtons(){ if (viewMode==="grid"){ gridViewBtn.classList.add("active"); listViewBtn.classList.remove("active"); } else { listViewBtn.classList.add("active"); gridViewBtn.classList.remove("active"); } }
init();

function debounce(fn, wait=200){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }
