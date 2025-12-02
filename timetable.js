const LS_TIMETABLE = "gearhub_timetable_v2";
let timetable = JSON.parse(localStorage.getItem(LS_TIMETABLE) || "{}");
const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
days.forEach(d=> timetable[d]=timetable[d]||[]);
const $ = id=>document.getElementById(id);
function save(){ localStorage.setItem(LS_TIMETABLE, JSON.stringify(timetable)); }
function uid(n=6){ return Math.random().toString(36).slice(2,2+n); }
document.addEventListener("DOMContentLoaded", ()=>{
  const daySelect = $("daySelect");
  if (!daySelect) return;
  days.forEach(d=> daySelect.innerHTML += `<option>${d}</option>`);
  $("addSlotBtn").addEventListener("click", ()=>{
    const day = daySelect.value, subject = $("subjectInput").value.trim(), time = $("timeInput").value.trim(), room = $("roomInput").value.trim();
    if(!subject||!time) return alert("Subject and time required");
    timetable[day].push({ id: uid(6), subject, time, room }); save(); render();
    $("subjectInput").value=""; $("timeInput").value=""; $("roomInput").value="";
  });
  render();
});
function render(){
  const week = $("weekGrid"); const tlist = $("todayList"); if (!week||!tlist) return;
  week.innerHTML = "";
  days.forEach(d=>{
    const col = document.createElement("div"); col.className="day-col";
    col.innerHTML = `<div style="font-weight:700;margin-bottom:8px">${d}</div>`;
    (timetable[d]||[]).forEach(s=>{
      const slot = document.createElement("div"); slot.className="slot";
      slot.innerHTML = `<strong>${s.subject}</strong><div class="secondary">${s.time}${s.room? " • "+s.room : ""}</div>
      <div style="text-align:right;margin-top:6px"><button class="ghost" onclick="deleteSlot('${d}','${s.id}')">Delete</button></div>`;
      col.appendChild(slot);
    });
    week.appendChild(col);
  });
  const todayName = days[new Date().getDay()-1] || "Monday";
  tlist.innerHTML="";
  (timetable[todayName]||[]).forEach(s=>{
    tlist.innerHTML += `<li><strong>${s.subject}</strong><div class="secondary">${s.time}${s.room? " • "+s.room:""}</div></li>`;
  });
}
window.deleteSlot = (day,id)=>{ timetable[day] = timetable[day].filter(x=>x.id!==id); save(); render(); }
