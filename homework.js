const LS_HW = "gearhub_homework_v1";
let hw = JSON.parse(localStorage.getItem(LS_HW) || "[]");
const $ = id => document.getElementById(id);
$("addHwBtn")?.addEventListener("click", ()=>{
  const title = $("hwTitle").value.trim(), due = $("hwDue").value, klass = $("hwClass").value.trim();
  if(!title||!due) return alert("Title and due date required");
  hw.push({ id: Date.now().toString(36), title, due, klass, submissions: [] });
  localStorage.setItem(LS_HW, JSON.stringify(hw)); render();
  $("hwTitle").value=""; $("hwDue").value=""; $("hwClass").value="";
});
function render(){
  const list = $("hwList"); list.innerHTML="";
  hw.forEach(h=>{
    const d=document.createElement("div"); d.style.padding="12px"; d.style.marginBottom="8px"; d.style.borderRadius="12px"; d.style.background="rgba(188,170,170,0.24)";
    d.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${h.title}</strong><span style="color:var(--secondary)">${new Date(h.due).toDateString()}</span></div>
      <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
        <button class="ghost" onclick="submitHw('${h.id}')">Submit</button>
        <button class="ghost" onclick="gradeHw('${h.id}')">Grade</button>
      </div>`;
    list.appendChild(d);
  });
}
window.submitHw = (id)=> {
  const file = prompt("Paste a URL or write your submission text (simple demo):");
  if(!file) return;
  const entry = hw.find(x=>x.id===id);
  entry.submissions.push({ id:Date.now().toString(36), user:"You", content:file, submittedAt:Date.now(), grade:null, remark:"" });
  localStorage.setItem(LS_HW, JSON.stringify(hw)); alert("Submitted (demo)");
}
window.gradeHw = (id)=> {
  const entry = hw.find(x=>x.id===id);
  const sid = prompt("Submission id to grade (open console to view hw var) — demo only");
  if(!sid) return;
  const sub = entry.submissions.find(s=>s.id===sid);
  if(!sub) return alert("Submission not found in demo");
  sub.grade = prompt("Grade (e.g., 85)");
  sub.remark = prompt("Remark");
  localStorage.setItem(LS_HW, JSON.stringify(hw)); alert("Graded (demo)");
}
render();
window.hw = hw; // expose for teacher demo in console