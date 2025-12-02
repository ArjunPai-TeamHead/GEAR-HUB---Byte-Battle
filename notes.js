/* Lightweight local-storage notes + peer summaries + quiz stub */
const LS_NOTES = "gearhub_notes_v2", LS_SUM = "gearhub_summaries_v2", LS_QUIZ = "gearhub_quizzes_v2";
const state = {
  notes: JSON.parse(localStorage.getItem(LS_NOTES) || "[]"),
  summaries: JSON.parse(localStorage.getItem(LS_SUM) || "[]"),
  quizzes: JSON.parse(localStorage.getItem(LS_QUIZ) || "[]"),
};
const $ = id => document.getElementById(id);
function save(){ localStorage.setItem(LS_NOTES, JSON.stringify(state.notes)); localStorage.setItem(LS_SUM, JSON.stringify(state.summaries)); }
function uid(n=8){ return Math.random().toString(36).slice(2,2+n); }

function renderNotes(){
  const q = ($("notesSearch")?.value||"").toLowerCase();
  const list = $("notesList"); list.innerHTML="";
  state.notes.filter(n=> n.subject.toLowerCase().includes(q) || n.tags.join(" ").toLowerCase().includes(q) ).forEach(n=>{
    const d=document.createElement("div"); d.className="note-card";
    d.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${n.subject}</strong><span class="note-meta">${n.name||''}</span></div>
      <div style="margin-top:8px"><span class="tag">${n.tags.join("</span> <span class='tag'>")}</span></div>
      <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
        <button class="ghost" onclick="downloadNote('${n.id}')">Download</button>
        <button class="ghost" onclick="createPractice('${n.id}')">Practice</button>
      </div>`;
    list.appendChild(d);
  });
  // selectors
  ["summaryNoteId"].forEach(sel=>{
    const s = $(sel);
    if(!s) return;
    s.innerHTML = state.notes.map(n=>`<option value="${n.id}">${n.subject} — ${n.name||""}</option>`).join("");
  });
}

function renderSummaries(){
  const list = $("summariesList"); list.innerHTML="";
  state.summaries.forEach(s=>{
    const note = state.notes.find(n=>n.id===s.noteId);
    const d=document.createElement("div"); d.className="summary-card";
    d.innerHTML = `<strong>${note?.subject||"Unknown"}</strong><p style="margin:.5rem 0">${s.text}</p><div class="summary-footer"><button class="ghost" onclick="upvote('${s.id}')">👍 ${s.upvotes||0}</button></div>`;
    list.appendChild(d);
  });
}

function downloadNote(id){
  const n = state.notes.find(x=>x.id===id); if(!n || !n.blob) return alert("File missing");
  const url = URL.createObjectURL(n.blob); const a=document.createElement("a"); a.href=url; a.download=n.name||"note"; a.click(); URL.revokeObjectURL(url);
}

$("uploadNotesForm")?.addEventListener("submit", async e=>{
  e.preventDefault();
  const subject = $("noteSubject").value.trim(); const tags = ($("noteTags").value||"").split(",").map(t=>t.trim()).filter(Boolean);
  const file = $("noteFile").files[0]; if(!subject || !file) return;
  const id = "n_"+uid(10);
  state.notes.unshift({ id, subject, tags, name:file.name, blob:file });
  save(); renderNotes(); e.target.reset();
});

$("peerSummaryForm")?.addEventListener("submit", e=>{
  e.preventDefault();
  const noteId = $("summaryNoteId").value; const text = $("summaryText").value.trim(); if(!noteId || !text) return;
  state.summaries.unshift({ id:"s_"+uid(8), noteId, text, upvotes:0 });
  save(); renderSummaries(); e.target.reset();
});

window.createPractice = (noteId)=>{
  alert("Practice stub: AI/teacher generator will be connected here. For now create a quiz on Notes page.");
};

window.upvote = (id)=>{ const s = state.summaries.find(x=>x.id===id); if(s){ s.upvotes=(s.upvotes||0)+1; save(); renderSummaries(); } };

$("notesSearch")?.addEventListener("input", renderNotes);

renderNotes(); renderSummaries();