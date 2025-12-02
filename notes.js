/* Notes + summaries + quiz, with working Practice (auto-create quiz if missing) */
const LS_NOTES = "gearhub_notes_v2", LS_SUM = "gearhub_summaries_v2", LS_QUIZ = "gearhub_quizzes_v2";
const state = {
  notes: JSON.parse(localStorage.getItem(LS_NOTES) || "[]"),
  summaries: JSON.parse(localStorage.getItem(LS_SUM) || "[]"),
  quizzes: JSON.parse(localStorage.getItem(LS_QUIZ) || "[]"),
};
const $ = id => document.getElementById(id);
const uid = (n=8)=> Math.random().toString(36).slice(2,2+n);
function save(){ localStorage.setItem(LS_NOTES, JSON.stringify(state.notes)); localStorage.setItem(LS_SUM, JSON.stringify(state.summaries)); localStorage.setItem(LS_QUIZ, JSON.stringify(state.quizzes)); }

function renderNotes(){
  const q = ($("notesSearch")?.value||"").toLowerCase();
  const list = $("notesList"); if(!list) return; list.innerHTML="";
  state.notes.filter(n=> (n.subject||"").toLowerCase().includes(q) || (n.tags||[]).join(" ").toLowerCase().includes(q) || (n.name||"").toLowerCase().includes(q))
    .forEach(n=>{
      const d=document.createElement("div"); d.className="note-card";
      d.innerHTML = `
        <div class="row" style="justify-content:space-between">
          <strong>${n.subject}</strong>
          <span class="secondary">${n.name||""}</span>
        </div>
        <div style="margin-top:6px">${(n.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(" ")}</div>
        <div class="row" style="justify-content:flex-end;margin-top:8px">
          <button class="ghost" onclick="downloadNote('${n.id}')">Download</button>
          <button onclick="practice('${n.id}')">Practice</button>
        </div>`;
      list.appendChild(d);
    });
  const sel = $("summaryNoteId"); if (sel) sel.innerHTML = state.notes.map(n=>`<option value="${n.id}">${n.subject} — ${n.name||""}</option>`).join("");
}
function renderSummaries(){
  const list = $("summariesList"); if(!list) return; list.innerHTML="";
  state.summaries.forEach(s=>{
    const note = state.notes.find(n=>n.id===s.noteId);
    const d=document.createElement("div"); d.className="summary-card";
    d.innerHTML = `<strong>${note?.subject||"Unknown"}</strong><p style="margin:.5rem 0">${s.text}</p><div style="display:flex;justify-content:flex-end;gap:8px"><button class="ghost" onclick="upvote('${s.id}')">👍 ${s.upvotes||0}</button></div>`;
    list.appendChild(d);
  });
}
function downloadNote(id){
  const n = state.notes.find(x=>x.id===id); if(!n || !n.blob) return alert("File missing");
  const url = URL.createObjectURL(n.blob); const a=document.createElement("a"); a.href=url; a.download=n.name||"note"; a.click(); URL.revokeObjectURL(url);
}
window.practice = (noteId)=>{
  let qz = state.quizzes.find(q=>q.noteId===noteId);
  if(!qz){
    // auto-create a simple quiz from tags/name as placeholders
    const note = state.notes.find(n=>n.id===noteId);
    qz = {
      id: "q_"+uid(10),
      noteId,
      title: `Practice: ${note?.subject || note?.name || "Quiz"}`,
      questions: [
        {q:`List two key ideas from ${note?.subject||"the note"}.`, type:"text"},
        {q:`True/False: One concept from ${note?.subject||"this note"} is correct.`, type:"tf", correct:"true"},
        {q:`Choose the most related tag for ${note?.subject||"this note"}.`, type:"mc", options:(note?.tags?.length? note.tags.slice(0,3):["A","B","C","D"]), correct:0}
      ]
    };
    state.quizzes.unshift(qz); save();
  }
  location.href = `quiz.html#note=${encodeURIComponent(noteId)}`;
};
window.upvote = (id)=>{ const s = state.summaries.find(x=>x.id===id); if(s){ s.upvotes=(s.upvotes||0)+1; save(); renderSummaries(); } };

$("uploadNotesForm")?.addEventListener("submit", e=>{
  e.preventDefault();
  const subject = $("noteSubject").value.trim();
  const tags = ($("noteTags").value||"").split(",").map(t=>t.trim()).filter(Boolean);
  const file = $("noteFile").files[0];
  if(!subject||!file) return;
  const id="n_"+uid(10);
  state.notes.unshift({ id, subject, tags, name:file.name, blob:file });
  save(); renderNotes(); e.target.reset();
});
$("peerSummaryForm")?.addEventListener("submit", e=>{
  e.preventDefault();
  const noteId = $("summaryNoteId").value; const text = $("summaryText").value.trim();
  if(!noteId||!text) return;
  state.summaries.unshift({ id:"s_"+uid(8), noteId, text, upvotes:0 });
  save(); renderSummaries(); e.target.reset();
});
$("notesSearch")?.addEventListener("input", renderNotes);
renderNotes(); renderSummaries();
