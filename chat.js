// Simple localStorage-backed chat mock with @ mentions parsing
const LS_CHAT_PREFIX = "gearhub_chat_";
let channel = "general";
const $ = id=>document.getElementById(id);
const messagesEl = $("messages");
function load(){ const data = JSON.parse(localStorage.getItem(LS_CHAT_PREFIX+channel) || "[]"); renderMsgs(data); }
function save(msgs){ localStorage.setItem(LS_CHAT_PREFIX+channel, JSON.stringify(msgs)); }
function renderMsgs(msgs){
  messagesEl.innerHTML = "";
  msgs.forEach(m=>{
    const d=document.createElement("div"); d.className="message "+(m.me? "me":"");
    d.innerHTML = `<div class="meta">${m.user} • ${new Date(m.ts).toLocaleTimeString()}</div><div class="body">${linkifyMentions(escapeHtml(m.text))}</div>`;
    messagesEl.appendChild(d);
  });
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function getMsgs(){ return JSON.parse(localStorage.getItem(LS_CHAT_PREFIX+channel) || "[]"); }
function post(text){
  const msgs = getMsgs();
  const me = true;
  msgs.push({ id: Date.now(), user: "You", text, ts: Date.now(), me });
  save(msgs); load();
}
function linkifyMentions(s){
  // @s -> student, @t -> teacher, @ad -> admin
  return s.replace(/@s(\w+)?/g, '<span class="mention">@s$1</span>')
          .replace(/@t(\w+)?/g, '<span class="mention">@t$1</span>')
          .replace(/@ad(\w+)?/g, '<span class="mention">@ad$1</span>');
}
function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

$("joinBtn").addEventListener("click", ()=> {
  channel = $("chatChannel").value.trim() || "general";
  load();
});
$("sendBtn").addEventListener("click", ()=> {
  const txt = $("chatInput").value.trim();
  if(!txt) return;
  post(txt);
  $("chatInput").value="";
});

// init
$("chatChannel").value = channel;
load();