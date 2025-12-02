const $ = id=>document.getElementById(id);
const LS_AV = "gearhub_avatar_v1";
function loadAvatar(){ const b64 = localStorage.getItem(LS_AV); if(b64) $("avatar").src = b64; }
$("uploadAvatarBtn")?.addEventListener("click", async ()=>{
  const f = $("avatarInput").files[0]; if(!f) return alert("Pick an image");
  const reader = new FileReader();
  reader.onload = ()=> { localStorage.setItem(LS_AV, reader.result); loadAvatar(); alert("Avatar saved locally"); }
  reader.readAsDataURL(f);
});
$("imeetBtn")?.addEventListener("click", ()=> alert("iMeet stub — integrate a video provider (Jitsi/Meet SDK) to enable real meetings."));
loadAvatar();