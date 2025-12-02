const LS_EVENTS = "gearhub_events_v2";
let events = JSON.parse(localStorage.getItem(LS_EVENTS) || "[]");
const $ = id => document.getElementById(id);
$("addEventBtn")?.addEventListener("click", ()=>{
  const title = $("eventTitle").value.trim(), date = $("eventDate").value, klass = $("eventClass").value.trim(), tags = ($("eventTags").value||"").split(",").map(t=>t.trim()).filter(Boolean);
  if(!title||!date) return alert("Title and date required");
  events.push({ id: Math.random().toString(36).slice(2,9), title, date, klass, tags });
  localStorage.setItem(LS_EVENTS, JSON.stringify(events)); render();
  $("eventTitle").value=""; $("eventDate").value=""; $("eventClass").value=""; $("eventTags").value="";
});
$("eventSearch")?.addEventListener("input", render);
function render(){
  const q=($("eventSearch")?.value||"").toLowerCase();
  const list = $("eventsList"); list.innerHTML="";
  events.sort((a,b)=> new Date(a.date)-new Date(b.date)).filter(e=> e.title.toLowerCase().includes(q) || (e.klass||"").toLowerCase().includes(q) || (e.tags||[]).some(t=>t.toLowerCase().includes(q))).forEach(e=>{
    const d=document.createElement("div"); d.className="event-card";
    d.innerHTML = `<div style="display:flex;justify-content:space-between"><strong>${e.title}</strong><span class="event-meta">${new Date(e.date).toDateString()} ${e.klass? "• "+e.klass:""}</span></div>
      <div style="margin-top:8px">${(e.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(" ")}</div>
      <div class="event-actions" style="margin-top:8px"><button class="ghost" onclick="deleteEvent('${e.id}')">Delete</button></div>`;
    list.appendChild(d);
  });
}
window.deleteEvent = id => { events = events.filter(x=>x.id!==id); localStorage.setItem(LS_EVENTS, JSON.stringify(events)); render(); }
render();