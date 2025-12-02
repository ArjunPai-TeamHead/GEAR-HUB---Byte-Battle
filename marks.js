const LS_MARKS = "gearhub_marks_v1";
let records = JSON.parse(localStorage.getItem(LS_MARKS) || "[]");
const $ = id => document.getElementById(id);
$("addMarkBtn")?.addEventListener("click", ()=>{
  const name = $("stuName").value.trim(), test = $("testName").value.trim(), mark = $("markVal").value.trim();
  if(!name||!test||!mark) return alert("All fields required");
  records.push({ id: Date.now().toString(36), name, test, mark, remark: "" });
  localStorage.setItem(LS_MARKS, JSON.stringify(records)); render();
  $("stuName").value=""; $("testName").value=""; $("markVal").value="";
});
function render(){
  const list = $("marksList"); list.innerHTML="";
  records.forEach(r=>{
    const d=document.createElement("div"); d.style.padding="10px"; d.style.marginBottom="8px"; d.style.borderRadius="12px"; d.style.background="rgba(188,170,170,0.24)";
    d.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${r.name}</strong><span style="color:var(--secondary)">${r.test} • ${r.mark}</span></div>
      <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end"><button class="ghost" onclick="addRemark('${r.id}')">Add Remark</button></div>`;
    list.appendChild(d);
  });
}
window.addRemark = (id)=> {
  const rec = records.find(r=>r.id===id); if(!rec) return;
  const note = prompt("Enter remark:");
  rec.remark = note; localStorage.setItem(LS_MARKS, JSON.stringify(records)); render();
}
render();