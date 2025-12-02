/* Sidebar user inject (avatar + name) */
(function(){
  try{
    const user = JSON.parse(localStorage.getItem("user")||"{}");
    const nameEl = document.getElementById("navName");
    if (nameEl) nameEl.textContent = user.username || "Arjun";
    const greetEl = document.getElementById("greetName");
    if (greetEl) greetEl.textContent = user.username || "Arjun";
  }catch(e){}
  const avatarEl = document.getElementById("navAvatar");
  const b64 = localStorage.getItem("gearhub_avatar_v1");
  if (avatarEl) avatarEl.src = b64 || "assets/pfp.png";
})();
