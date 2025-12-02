const $ = id=>document.getElementById(id);
const LS_AV = "gearhub_avatar_v1";
function loadAvatar(){ const b64 = localStorage.getItem(LS_AV); if(b64) $("avatar").src = b64; if ($("navAvatar") && b64) $("navAvatar").src=b64; }
$("uploadAvatarBtn")?.addEventListener("click", ()=>{
  const f = $("avatarInput").files[0]; if(!f) return alert("Pick an image");
  const reader = new FileReader();
  reader.onload = ()=> { localStorage.setItem(LS_AV, reader.result); loadAvatar(); alert("Avatar saved"); };
  reader.readAsDataURL(f);
});
/* iMeet via Jitsi IFrame API */
let api = null;
$("imeetBtn")?.addEventListener("click", ()=>{
  $("meetOverlay").classList.remove("hidden");
  const user = JSON.parse(localStorage.getItem("user")||"{}");
  const room = `GEARHUB-${(user.username||"guest").replace(/\W+/g,'')}-${Date.now().toString(36)}`;
  const domain = "meet.jit.si";
  const options = {
    roomName: room,
    parentNode: $("meetContainer"),
    userInfo: { displayName: user.username || "Guest" }
  };
  api = new JitsiMeetExternalAPI(domain, options);
});
$("closeMeet")?.addEventListener("click", ()=>{
  if (api) { api.dispose(); api = null; }
  $("meetOverlay").classList.add("hidden");
});
loadAvatar();
